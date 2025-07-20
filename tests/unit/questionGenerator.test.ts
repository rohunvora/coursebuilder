import { generateQuestion } from './questionGenerator'

describe('Question Generator', () => {
  const testCases = [
    { topic: 'Stoic Philosophy', skillName: 'Core Stoic Principles', bloomIndex: 0 },
    { topic: 'Python Decorators', skillName: 'Function Wrapping Basics', bloomIndex: 2 },
    { topic: 'Italian Pasta Shapes', skillName: 'Regional Pasta Varieties', bloomIndex: 4 },
  ]

  testCases.forEach(({ topic, skillName, bloomIndex }) => {
    it(`should generate high-quality question for ${topic} - ${skillName}`, async () => {
      const question = await generateQuestion(topic, skillName, bloomIndex)
      
      // Basic structure validation
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('choices')
      expect(question).toHaveProperty('correctIndex')
      expect(question).toHaveProperty('explanation')
      expect(question).toHaveProperty('bloomLevel')
      expect(question).toHaveProperty('criticScore')
      
      // Content validation
      expect(question.question.length).toBeLessThanOrEqual(140)
      expect(question.choices).toHaveLength(4)
      question.choices.forEach(choice => {
        expect(choice.length).toBeLessThanOrEqual(60)
      })
      expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex).toBeLessThan(4)
      expect(question.explanation.length).toBeGreaterThan(0)
      
      // Quality validation
      expect(question.criticScore).toBeGreaterThanOrEqual(8)
      
      console.log(`Generated question for ${topic}:`)
      console.log(`  Question: ${question.question}`)
      console.log(`  Critic Score: ${question.criticScore}/10`)
    }, 30000) // 30 second timeout for API calls
  })
})