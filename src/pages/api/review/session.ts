import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { getDueSkills } from '@/lib/learnerModel/spacedRepetition'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const userId = req.headers['x-user-id'] as string || 'demo-user'

  try {
    // Get user with due skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          where: {
            nextReviewAt: {
              lte: new Date(),
            },
          },
          include: {
            skill: true,
          },
          orderBy: {
            nextReviewAt: 'asc',
          },
          take: 20, // Max 20 reviews per session
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const dueSkills = user.skills.map(us => ({
      id: us.id,
      skill: {
        id: us.skill.id,
        name: us.skill.name,
        explanation: us.skill.explanation,
        question: us.skill.question,
        choices: JSON.parse(us.skill.choices),
        correctIndex: us.skill.correctIndex,
        questionExplanation: us.skill.questionExplanation,
        bloomLevel: us.skill.bloomLevel,
      },
      knowledge: us.knowledgeProb,
      nextReviewAt: us.nextReviewAt,
      intervalDays: us.intervalDays,
      easeFactor: us.easeFactor,
    }))

    return res.status(200).json({
      userId,
      dueSkills,
    })
  } catch (error) {
    console.error('Error loading review session:', error)
    return res.status(500).json({ message: 'Failed to load review session' })
  }
}