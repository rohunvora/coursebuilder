import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'User ID is required' })
  }

  if (req.method === 'GET') {
    try {
      let user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: { id: userId },
        })
      }

      return res.status(200).json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ message: 'Failed to fetch user' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}