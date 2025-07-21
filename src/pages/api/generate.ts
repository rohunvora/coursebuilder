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
  console.log('[Generate API] Request received:', { 
    method: req.method, 
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'x-user-id': req.headers['x-user-id']
    }
  })
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { topic, userId } = req.body
  console.log('[Generate API] Parsed params:', { topic, userId })

  if (!topic || typeof topic !== 'string') {
    console.error('[Generate API] Invalid topic:', topic)
    return res.status(400).json({ message: 'Topic is required' })
  }
  
  if (!userId || typeof userId !== 'string') {
    console.error('[Generate API] Invalid userId:', userId)
    return res.status(400).json({ message: 'User ID is required' })
  }
  
  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('[Generate API] OpenAI API key not configured')
    return res.status(500).json({ 
      message: 'Course generation service not configured. Please check server settings.',
      debug: process.env.NODE_ENV === 'development' ? {
        hint: 'OPENAI_API_KEY environment variable is missing',
        checkUrl: '/api/test/diagnose'
      } : undefined
    })
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
    console.log('[Generate API] Parsing goal...')
    const parsedGoal = await parseGoal(topic)
    console.log('[Generate API] Goal parsed:', { 
      topic: parsedGoal.topic, 
      microSkillsCount: parsedGoal.microSkills.length 
    })
    
    // Plan curriculum
    console.log('[Generate API] Planning curriculum...')
    const curriculum = planCurriculum(parsedGoal.microSkills)
    console.log('[Generate API] Curriculum planned:', { 
      skillsCount: curriculum.length 
    })
    
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
    console.error('[Generate API] Error generating course:', error)
    console.error('[Generate API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // More specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return res.status(500).json({ message: 'Course generation service not configured properly.' })
      }
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ message: 'Too many requests. Please try again in a moment.' })
      }
      if (error.message.includes('timeout')) {
        return res.status(504).json({ message: 'Course generation took too long. Please try again.' })
      }
    }
    
    return res.status(500).json({ message: 'Failed to generate course. Please try again.' })
  }
}