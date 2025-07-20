import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { courseId } = req.query

  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ message: 'Course ID is required' })
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        microSkills: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Transform for frontend compatibility
    const transformed = {
      id: course.id,
      title: course.title,
      createdAt: course.createdAt.getTime(),
      microSkills: course.microSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        explanation: skill.explanation,
        quiz: {
          id: skill.id,
          question: skill.question,
          choices: JSON.parse(skill.choices),
          correctIndex: skill.correctIndex,
          explanation: skill.questionExplanation,
          bloomLevel: skill.bloomLevel,
          criticScore: 8, // Default for v1.2
        },
      })),
    }

    return res.status(200).json(transformed)
  } catch (error) {
    console.error('Error fetching course:', error)
    return res.status(500).json({ message: 'Failed to fetch course' })
  }
}