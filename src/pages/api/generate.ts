import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/db'
import { parseGoal } from '@/lib/coursePipeline/goalParser'
import { planCurriculum } from '@/lib/coursePipeline/curriculumPlanner'
import { generateQuestion } from '@/lib/questionGenerator'
import { getCachedCourse, setCachedCourse, checkRateLimit } from '@/lib/cache'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { topic, userId } = req.body

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ message: 'Topic is required' })
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous'
  
  if (!checkRateLimit(clientIp.toString())) {
    return res.status(429).json({ message: 'Too many requests. Please wait 1 minute.' })
  }

  try {
    // Check cache first
    const cached = getCachedCourse(topic)
    if (cached) {
      // Create user course relation if userId provided
      if (userId) {
        await prisma.userCourse.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId: cached.id,
            },
          },
          update: {},
          create: {
            userId,
            courseId: cached.id,
          },
        })
      }
      return res.status(200).json({ courseId: cached.id })
    }

    // Parse learning goal
    const parsedGoal = await parseGoal(topic)
    
    // Plan curriculum
    const curriculum = planCurriculum(parsedGoal.microSkills)
    
    // Generate course
    const courseId = nanoid(12)
    const course = await prisma.course.create({
      data: {
        id: courseId,
        title: parsedGoal.topic,
        topic: topic,
        microSkills: {
          create: await Promise.all(
            curriculum.map(async (skill, index) => {
              const question = await generateQuestion(
                parsedGoal.topic,
                skill.skillName,
                index
              )
              
              return {
                id: nanoid(8),
                name: skill.skillName,
                explanation: parsedGoal.learningObjectives[index] || skill.skillName,
                orderIndex: index,
                bloomLevel: skill.bloomLevel,
                question: question.question,
                choices: JSON.stringify(question.choices),
                correctIndex: question.correctIndex,
                questionExplanation: question.explanation,
              }
            })
          ),
        },
      },
      include: {
        microSkills: true,
      },
    })
    
    // Create user course relation if userId provided
    if (userId) {
      await prisma.userCourse.create({
        data: {
          userId,
          courseId: course.id,
        },
      })
    }
    
    // Cache the course
    setCachedCourse(topic, course)
    
    // Log quality metrics
    console.log(`Course generated: ${course.title}`)
    course.microSkills.forEach((skill, index) => {
      console.log(`  Skill ${index + 1}: ${skill.name} - ${skill.bloomLevel}`)
    })
    
    return res.status(200).json({ courseId: course.id })
  } catch (error) {
    console.error('Error generating course:', error)
    return res.status(500).json({ message: 'Failed to generate course. Please try again.' })
  }
}