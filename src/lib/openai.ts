import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MicroSkill {
  id: string
  name: string
  explanation: string
  quiz: {
    question: string
    options: string[]
    correctIndex: number
  }
}

export interface Course {
  id: string
  title: string
  microSkills: MicroSkill[]
  createdAt: number
}

const systemPrompt = `You are a course generation AI. Create bite-sized, gamified courses on any topic.
Break down the topic into 5-10 micro-skills, each with:
1. A clear, concise name
2. A brief explanation (2-3 sentences)
3. A single multiple-choice quiz question with 4 options

Make the content engaging, clear, and progressive in difficulty.
Return JSON in this exact format:
{
  "title": "Course title",
  "microSkills": [
    {
      "id": "unique-id",
      "name": "Skill name",
      "explanation": "Brief explanation",
      "quiz": {
        "question": "Quiz question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0
      }
    }
  ]
}`

export async function generateCourse(topic: string): Promise<Course> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a course on: ${topic}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const data = JSON.parse(content)
    
    return {
      id: Math.random().toString(36).substring(7),
      title: data.title,
      microSkills: data.microSkills.map((skill: any, index: number) => ({
        ...skill,
        id: skill.id || `skill-${index}`,
      })),
      createdAt: Date.now(),
    }
  } catch (error) {
    console.error('Error generating course:', error)
    throw new Error('Failed to generate course')
  }
}