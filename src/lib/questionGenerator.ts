import OpenAI from 'openai'
import { env } from './env'
import { nanoid } from 'nanoid'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface Question {
  id: string
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  bloomLevel: string
  criticScore?: number
}

export interface MicroSkill {
  id: string
  name: string
  explanation: string
  quiz: Question
}

export interface Course {
  id: string
  title: string
  microSkills: MicroSkill[]
  createdAt: number
}

const bloomLevels = [
  { level: 'Remember', verbs: ['identify', 'recall', 'recognize', 'list'] },
  { level: 'Understand', verbs: ['explain', 'describe', 'summarize', 'interpret'] },
  { level: 'Apply', verbs: ['demonstrate', 'use', 'implement', 'solve'] },
  { level: 'Analyze', verbs: ['compare', 'contrast', 'examine', 'categorize'] },
  { level: 'Evaluate', verbs: ['judge', 'critique', 'assess', 'justify'] },
]

const questionGeneratorPrompt = `You are an expert educational content creator specializing in creating high-quality multiple-choice questions.

CRITICAL REQUIREMENTS:
1. Question stem: ≤ 140 characters
2. Each choice: ≤ 60 characters  
3. Explanation: One clear sentence explaining why the answer is correct
4. All distractors must be:
   - Plausible and believable at first glance
   - Mutually exclusive with the correct answer
   - Clearly wrong once the explanation is read
   - Related to common misconceptions or partial understanding

Create a question following these exact specifications.`

const criticPrompt = `You are a quality control expert for educational content. Rate the following multiple-choice question on a scale of 1-10 based on:

1. Correctness: Is the correct answer actually correct?
2. Clarity: Is the question clear and unambiguous?
3. Distractor Quality: Are the wrong answers plausible but clearly incorrect?
4. Educational Value: Does this question test meaningful knowledge?
5. Format Compliance: Does it meet the length requirements?

Respond with ONLY a JSON object: {"score": X, "brief_reason": "..."}`

export async function generateQuestion(
  topic: string,
  skillName: string,
  bloomIndex: number
): Promise<Question> {
  const bloom = bloomLevels[Math.min(bloomIndex, bloomLevels.length - 1)]
  const verb = bloom.verbs[Math.floor(Math.random() * bloom.verbs.length)]

  const systemPrompt = `${questionGeneratorPrompt}

Topic: ${topic}
Skill: ${skillName}
Bloom's Level: ${bloom.level}
Action Verb: ${verb}

Return JSON only:
{
  "question": "...",
  "choices": ["A", "B", "C", "D"],
  "correctIndex": 0-3,
  "explanation": "..."
}`

  let attempts = 0
  let bestQuestion: Question | null = null
  let bestScore = 0

  while (attempts < 2) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a ${bloom.level}-level question about ${skillName} in ${topic}.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) throw new Error('No content generated')

      const data = JSON.parse(content)
      const question: Question = {
        id: nanoid(8),
        question: data.question.substring(0, 140),
        choices: data.choices.map((c: string) => c.substring(0, 60)),
        correctIndex: data.correctIndex,
        explanation: data.explanation,
        bloomLevel: bloom.level,
      }

      // Validate with critic
      const criticCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: criticPrompt },
          { role: 'user', content: JSON.stringify(question) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      })

      const criticContent = criticCompletion.choices[0]?.message?.content
      if (criticContent) {
        const critic = JSON.parse(criticContent)
        question.criticScore = critic.score

        if (critic.score >= 8) {
          return question
        }

        if (!bestQuestion || critic.score > bestScore) {
          bestQuestion = question
          bestScore = critic.score
        }
      }
    } catch (error) {
      console.error('Error generating question:', error)
    }

    attempts++
  }

  return bestQuestion || {
    id: nanoid(8),
    question: `What is an important aspect of ${skillName}?`,
    choices: ['Understanding', 'Practice', 'Theory', 'Application'],
    correctIndex: 0,
    explanation: 'Understanding is fundamental to mastering any skill.',
    bloomLevel: bloom.level,
    criticScore: 5,
  }
}

export async function generateCourse(topic: string): Promise<Course> {
  const systemPrompt = `You are an expert course designer. Create a structured learning path for the given topic.

Break it down into exactly 7 micro-skills that progress logically from basic to advanced.
Skills 1-3 should focus on foundational concepts (Remember/Understand/Apply).
Skills 4-7 should build toward analysis and evaluation.

Return JSON only:
{
  "title": "Learning [Topic]: From Basics to Mastery",
  "skills": [
    {
      "name": "Skill name (2-5 words)",
      "explanation": "What the learner will master (1-2 sentences)"
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a course structure for: ${topic}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content generated')

    const data = JSON.parse(content)
    
    // Generate questions for each skill
    const microSkills: MicroSkill[] = await Promise.all(
      data.skills.slice(0, 7).map(async (skill: any, index: number) => {
        const question = await generateQuestion(topic, skill.name, index)
        return {
          id: nanoid(8),
          name: skill.name,
          explanation: skill.explanation,
          quiz: question,
        }
      })
    )

    return {
      id: nanoid(12),
      title: data.title,
      microSkills,
      createdAt: Date.now(),
    }
  } catch (error) {
    console.error('Error generating course:', error)
    throw new Error('Failed to generate course')
  }
}