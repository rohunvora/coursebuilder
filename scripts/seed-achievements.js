const fetch = require('node-fetch')

async function seedAchievements() {
  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/achievements/seed`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to seed achievements: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('Achievements seeded successfully:', result)
  } catch (error) {
    console.error('Error seeding achievements:', error)
    // Don't fail the build if seeding fails
  }
}

seedAchievements()