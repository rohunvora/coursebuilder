import OpenAI from 'openai'
import { env } from '../env'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface ParsedGoal {
  topic: string
  microSkills: string[]
  learningObjectives: string[]
  estimatedDuration: number // in minutes
}

const systemPrompt = `You are an expert educational goal parser. Analyze the user's learning goal and break it down into:
1. Core topic (concise title)
2. 7 specific micro-skills needed to master this topic
3. Clear learning objectives for each skill
4. Estimated time to complete the course (in minutes)

Focus on practical, actionable skills that build upon each other.

Return JSON only:
{
  "topic": "Topic Title",
  "microSkills": ["Skill 1", "Skill 2", ...],
  "learningObjectives": ["Objective 1", "Objective 2", ...],
  "estimatedDuration": 30
}`

export async function parseGoal(userInput: string): Promise<ParsedGoal> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this learning goal: ${userInput}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content generated')

    const parsed = JSON.parse(content)
    
    // Ensure we have exactly 7 skills
    if (parsed.microSkills.length !== 7) {
      parsed.microSkills = parsed.microSkills.slice(0, 7)
      parsed.learningObjectives = parsed.learningObjectives.slice(0, 7)
    }

    return {
      topic: parsed.topic,
      microSkills: parsed.microSkills,
      learningObjectives: parsed.learningObjectives,
      estimatedDuration: parsed.estimatedDuration || 30,
    }
  } catch (error) {
    console.error('Error parsing goal:', error)
    throw new Error('Failed to parse learning goal')
  }
}