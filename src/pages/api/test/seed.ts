import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'

// Test course data
const testCourse = {
  id: 'test-course-stoicism',
  title: 'Introduction to Stoic Philosophy',
  topic: 'Stoic Philosophy',
  microSkills: [
    {
      id: 'skill-stoic-1',
      name: 'Core Stoic Principles',
      explanation: 'Understand the four cardinal virtues of Stoicism',
      orderIndex: 0,
      bloomLevel: 'Remember',
      question: 'Which of these is NOT one of the four cardinal virtues in Stoicism?',
      choices: ['Wisdom', 'Justice', 'Wealth', 'Courage'],
      correctIndex: 2,
      questionExplanation: 'The four cardinal virtues are Wisdom, Justice, Courage, and Temperance. Wealth is not a virtue in Stoicism.'
    },
    {
      id: 'skill-stoic-2',
      name: 'Dichotomy of Control',
      explanation: 'Distinguish between what is and isn\'t under our control',
      orderIndex: 1,
      bloomLevel: 'Understand',
      question: 'According to Epictetus, what is truly under our control?',
      choices: ['Our reputation', 'Our thoughts and judgments', 'Others\' actions', 'External events'],
      correctIndex: 1,
      questionExplanation: 'Epictetus taught that only our thoughts, judgments, and will are truly under our control.'
    },
    {
      id: 'skill-stoic-3',
      name: 'Applying Stoic Practices',
      explanation: 'Apply Stoic exercises to daily life',
      orderIndex: 2,
      bloomLevel: 'Apply',
      question: 'Which practice helps develop gratitude in Stoicism?',
      choices: ['Negative visualization', 'Seeking pleasure', 'Avoiding discomfort', 'Accumulating wealth'],
      correctIndex: 0,
      questionExplanation: 'Negative visualization (premeditatio malorum) helps us appreciate what we have by imagining its loss.'
    }
  ]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development or with secret key
  if (process.env.NODE_ENV === 'production' && req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🌱 Seeding test data via API...')
    
    // Create test course
    const course = await prisma.course.upsert({
      where: { id: testCourse.id },
      create: {
        id: testCourse.id,
        title: testCourse.title,
        topic: testCourse.topic,
        microSkills: {
          create: testCourse.microSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            explanation: skill.explanation,
            orderIndex: skill.orderIndex,
            bloomLevel: skill.bloomLevel,
            question: skill.question,
            choices: JSON.stringify(skill.choices),
            correctIndex: skill.correctIndex,
            questionExplanation: skill.questionExplanation
          }))
        }
      },
      update: {},
      include: {
        microSkills: true
      }
    })
    
    // Create test user with progress
    const testUserId = 'test-user-intermediate'
    
    const user = await prisma.user.upsert({
      where: { id: testUserId },
      create: { id: testUserId },
      update: { lastActive: new Date() }
    })
    
    // Create user course enrollment
    await prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: testUserId,
          courseId: testCourse.id
        }
      },
      create: {
        userId: testUserId,
        courseId: testCourse.id,
        currentXP: 20
      },
      update: {
        currentXP: 20
      }
    })
    
    // Create skill progress for first two skills
    const skillProgress = [
      { skillId: 'skill-stoic-1', correctAttempts: 3, totalAttempts: 4, knowledgeProb: 0.85 },
      { skillId: 'skill-stoic-2', correctAttempts: 2, totalAttempts: 3, knowledgeProb: 0.72 }
    ]
    
    for (const progress of skillProgress) {
      await prisma.userSkill.upsert({
        where: {
          userId_skillId: {
            userId: testUserId,
            skillId: progress.skillId
          }
        },
        create: {
          userId: testUserId,
          skillId: progress.skillId,
          correctAttempts: progress.correctAttempts,
          totalAttempts: progress.totalAttempts,
          knowledgeProb: progress.knowledgeProb
        },
        update: {
          correctAttempts: progress.correctAttempts,
          totalAttempts: progress.totalAttempts,
          knowledgeProb: progress.knowledgeProb
        }
      })
    }
    
    return res.status(200).json({
      success: true,
      message: 'Test data seeded successfully',
      course: {
        id: course.id,
        title: course.title,
        skills: course.microSkills.length
      },
      user: {
        id: testUserId,
        xp: 20,
        skills: skillProgress.length
      }
    })
    
  } catch (error) {
    console.error('Error seeding test data:', error)
    return res.status(500).json({ 
      error: 'Failed to seed test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}