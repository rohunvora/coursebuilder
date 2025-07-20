import type { NextApiRequest, NextApiResponse } from 'next'
import { parseGoal } from '@/lib/coursePipeline/goalParser'
import { planCurriculum } from '@/lib/coursePipeline/curriculumPlanner'
import { generateQuestion } from '@/lib/questionGenerator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow GET for easy testing
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { topic = 'Stoic Philosophy', userId = 'debug-user' } = req.query

  console.log('[Debug Generate] Starting with:', { topic, userId })

  const debugInfo = {
    request: {
      method: req.method,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-user-id': req.headers['x-user-id']
      }
    },
    environment: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      hasDatabase: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    },
    steps: [],
    error: null,
    result: null
  }

  try {
    // Step 1: Parse goal
    debugInfo.steps.push({ step: 'parseGoal', status: 'starting' })
    const parsedGoal = await parseGoal(topic as string)
    debugInfo.steps.push({ 
      step: 'parseGoal', 
      status: 'completed',
      result: {
        topic: parsedGoal.topic,
        microSkillsCount: parsedGoal.microSkills.length,
        microSkills: parsedGoal.microSkills
      }
    })

    // Step 2: Plan curriculum  
    debugInfo.steps.push({ step: 'planCurriculum', status: 'starting' })
    const curriculum = planCurriculum(parsedGoal.microSkills)
    debugInfo.steps.push({ 
      step: 'planCurriculum', 
      status: 'completed',
      result: {
        skillsCount: curriculum.length,
        bloomLevels: curriculum.map(s => s.bloomLevel)
      }
    })

    // Step 3: Generate sample question
    debugInfo.steps.push({ step: 'generateQuestion', status: 'starting' })
    const sampleQuestion = await generateQuestion(
      parsedGoal.topic,
      curriculum[0].skillName,
      0
    )
    debugInfo.steps.push({ 
      step: 'generateQuestion', 
      status: 'completed',
      result: {
        question: sampleQuestion.question,
        choicesCount: sampleQuestion.choices.length,
        hasExplanation: !!sampleQuestion.explanation
      }
    })

    debugInfo.result = {
      success: true,
      courseStructure: {
        title: parsedGoal.topic,
        skillsCount: curriculum.length,
        sampleSkill: curriculum[0],
        sampleQuestion: sampleQuestion
      }
    }

  } catch (error) {
    console.error('[Debug Generate] Error:', error)
    debugInfo.error = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }
    debugInfo.result = { success: false }
  }

  res.status(200).json(debugInfo)
}