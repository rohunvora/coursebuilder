const { PrismaClient } = require('@prisma/client')
const { nanoid } = require('nanoid')

const prisma = new PrismaClient()

// Test course data
const testCourse = {
  id: 'test-course-stoicism',
  title: 'Introduction to Stoic Philosophy',
  topic: 'Stoic Philosophy',
  microSkills: [
    {
      id: 'skill-stoic-1',
      name: 'Core Stoic Principles',
      explanation: 'Understand the four cardinal virtues of Stoicism',
      orderIndex: 0,
      bloomLevel: 'Remember',
      question: 'Which of these is NOT one of the four cardinal virtues in Stoicism?',
      choices: ['Wisdom', 'Justice', 'Wealth', 'Courage'],
      correctIndex: 2,
      questionExplanation: 'The four cardinal virtues are Wisdom, Justice, Courage, and Temperance. Wealth is not a virtue in Stoicism.'
    },
    {
      id: 'skill-stoic-2',
      name: 'Dichotomy of Control',
      explanation: 'Distinguish between what is and isn\'t under our control',
      orderIndex: 1,
      bloomLevel: 'Understand',
      question: 'According to Epictetus, what is truly under our control?',
      choices: ['Our reputation', 'Our thoughts and judgments', 'Others\' actions', 'External events'],
      correctIndex: 1,
      questionExplanation: 'Epictetus taught that only our thoughts, judgments, and will are truly under our control.'
    },
    {
      id: 'skill-stoic-3',
      name: 'Applying Stoic Practices',
      explanation: 'Apply Stoic exercises to daily life',
      orderIndex: 2,
      bloomLevel: 'Apply',
      question: 'Which practice helps develop gratitude in Stoicism?',
      choices: ['Negative visualization', 'Seeking pleasure', 'Avoiding discomfort', 'Accumulating wealth'],
      correctIndex: 0,
      questionExplanation: 'Negative visualization (premeditatio malorum) helps us appreciate what we have by imagining its loss.'
    },
    {
      id: 'skill-stoic-4',
      name: 'Analyzing Stoic Texts',
      explanation: 'Analyze key passages from Stoic philosophers',
      orderIndex: 3,
      bloomLevel: 'Analyze',
      question: 'What does Marcus Aurelius mean by "The impediment to action advances action"?',
      choices: ['Avoid all obstacles', 'Obstacles become opportunities', 'Never take action', 'Wait for perfect conditions'],
      correctIndex: 1,
      questionExplanation: 'This principle teaches that obstacles can be transformed into opportunities for growth and virtue.'
    },
    {
      id: 'skill-stoic-5',
      name: 'Evaluating Stoic Wisdom',
      explanation: 'Evaluate the application of Stoic principles',
      orderIndex: 4,
      bloomLevel: 'Evaluate',
      question: 'Which response best demonstrates Stoic wisdom in facing criticism?',
      choices: ['Ignoring all feedback', 'Immediate retaliation', 'Reflecting on valid points calmly', 'Seeking revenge later'],
      correctIndex: 2,
      questionExplanation: 'Stoics advocate for rational reflection on criticism, extracting value while maintaining emotional equilibrium.'
    }
  ]
}

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...')
    
    // Create test course
    const course = await prisma.course.create({
      data: {
        id: testCourse.id,
        title: testCourse.title,
        topic: testCourse.topic,
        microSkills: {
          create: testCourse.microSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            explanation: skill.explanation,
            orderIndex: skill.orderIndex,
            bloomLevel: skill.bloomLevel,
            question: skill.question,
            choices: JSON.stringify(skill.choices),
            correctIndex: skill.correctIndex,
            questionExplanation: skill.questionExplanation
          }))
        }
      },
      include: {
        microSkills: true
      }
    })
    
    console.log(`✅ Created test course: ${course.title}`)
    console.log(`   With ${course.microSkills.length} micro-skills`)
    
    // Create test users with different progress levels
    const testUsers = [
      {
        id: 'test-user-intermediate',
        courses: [{ courseId: testCourse.id, currentXP: 20 }],
        skills: [
          { skillId: 'skill-stoic-1', correctAttempts: 3, totalAttempts: 4, knowledgeProb: 0.85 },
          { skillId: 'skill-stoic-2', correctAttempts: 2, totalAttempts: 3, knowledgeProb: 0.72 }
        ]
      }
    ]
    
    for (const userData of testUsers) {
      // Create or update user
      const user = await prisma.user.upsert({
        where: { id: userData.id },
        create: { id: userData.id },
        update: { lastActive: new Date() }
      })
      
      console.log(`\n✅ Created/updated test user: ${user.id}`)
      
      // Create user course enrollment
      for (const courseData of userData.courses) {
        await prisma.userCourse.upsert({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseData.courseId
            }
          },
          create: {
            userId: user.id,
            courseId: courseData.courseId,
            currentXP: courseData.currentXP
          },
          update: {
            currentXP: courseData.currentXP
          }
        })
      }
      
      // Create user skill progress
      for (const skillData of userData.skills) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId: user.id,
              skillId: skillData.skillId
            }
          },
          create: {
            userId: user.id,
            skillId: skillData.skillId,
            correctAttempts: skillData.correctAttempts,
            totalAttempts: skillData.totalAttempts,
            knowledgeProb: skillData.knowledgeProb
          },
          update: {
            correctAttempts: skillData.correctAttempts,
            totalAttempts: skillData.totalAttempts,
            knowledgeProb: skillData.knowledgeProb
          }
        })
      }
    }
    
    console.log('\n📊 Test data seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Run the seed function
seedTestData()