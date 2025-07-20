import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { updateKnowledge } from '@/lib/learnerModel/knowledgeTracker'
import { calculateNextReview, AnswerQuality } from '@/lib/learnerModel/spacedRepetition'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId, skillId, correct, responseTime, quality } = req.body

  if (!userId || !skillId || correct === undefined) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Get current skill state
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    })

    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found' })
    }

    // Update knowledge using Bayesian tracking
    const updatedKnowledge = updateKnowledge(
      {
        skillId,
        probability: userSkill.knowledgeProb,
        correctAttempts: userSkill.correctAttempts,
        totalAttempts: userSkill.totalAttempts,
        lastUpdated: userSkill.lastReviewedAt,
      },
      correct
    )

    // Calculate next review schedule
    const schedule = calculateNextReview(
      {
        lastReviewedAt: userSkill.lastReviewedAt,
        nextReviewAt: userSkill.nextReviewAt,
        intervalDays: userSkill.intervalDays,
        easeFactor: userSkill.easeFactor,
        repetitions: userSkill.correctAttempts,
      },
      quality as AnswerQuality
    )

    // Update skill in database
    const updated = await prisma.userSkill.update({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      data: {
        knowledgeProb: updatedKnowledge.probability,
        correctAttempts: updatedKnowledge.correctAttempts,
        totalAttempts: updatedKnowledge.totalAttempts,
        lastReviewedAt: new Date(),
        nextReviewAt: schedule.nextReviewAt,
        intervalDays: schedule.intervalDays,
        easeFactor: schedule.easeFactor,
        avgResponseTime: Math.round(
          (userSkill.avgResponseTime * userSkill.totalAttempts + responseTime) /
          (userSkill.totalAttempts + 1)
        ),
        confidence: quality ? quality / 5 : userSkill.confidence,
      },
    })

    // Update daily streak
    await prisma.dailyStreak.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(),
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        date: new Date(),
        completed: true,
      },
    })

    return res.status(200).json({
      success: true,
      knowledge: updated.knowledgeProb,
      nextReview: updated.nextReviewAt,
    })
  } catch (error) {
    console.error('Error updating skill:', error)
    return res.status(500).json({ message: 'Failed to update skill' })
  }
}