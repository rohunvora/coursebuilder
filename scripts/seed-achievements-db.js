const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const achievements = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first lesson', icon: '🎯', xpReward: 50 },
  { id: 'streak-3', name: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: '🔥', xpReward: 100 },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', xpReward: 250 },
  { id: 'streak-30', name: 'Habit Former', description: 'Maintain a 30-day streak', icon: '💎', xpReward: 1000 },
  { id: 'master-skill', name: 'Skill Master', description: 'Master your first skill', icon: '🏆', xpReward: 200 },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Answer 5 questions correctly in a row', icon: '💯', xpReward: 150 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Answer correctly in under 5 seconds', icon: '⚡', xpReward: 75 },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after midnight', icon: '🦉', xpReward: 50 },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', xpReward: 50 },
  { id: 'course-complete', name: 'Course Complete', description: 'Finish your first course', icon: '🎓', xpReward: 300 },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 200 },
  { id: 'level-10', name: 'Knowledge Seeker', description: 'Reach level 10', icon: '🌟', xpReward: 500 },
]

async function seedAchievements() {
  try {
    console.log('🌱 Seeding achievements...')
    
    // Use createMany with skipDuplicates to avoid errors if achievements already exist
    const result = await prisma.achievement.createMany({
      data: achievements,
      skipDuplicates: true,
    })
    
    console.log(`✅ Seeded ${result.count} new achievements`)
    
    // Show total achievements
    const total = await prisma.achievement.count()
    console.log(`📊 Total achievements in database: ${total}`)
    
  } catch (error) {
    console.error('❌ Error seeding achievements:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Run the seed function
seedAchievements()