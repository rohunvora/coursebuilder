import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Seed achievements
    for (const achievement of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { id: achievement.id },
        update: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        },
        create: {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        },
      })
    }

    return res.status(200).json({ 
      message: 'Achievements seeded successfully',
      count: ACHIEVEMENTS.length 
    })
  } catch (error) {
    console.error('Error seeding achievements:', error)
    return res.status(500).json({ message: 'Failed to seed achievements' })
  }
}