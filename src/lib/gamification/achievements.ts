export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  category: 'learning' | 'streak' | 'mastery' | 'speed' | 'exploration'
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  totalXP: number
  coursesCompleted: number
  skillsMastered: number
  currentStreak: number
  longestStreak: number
  totalQuestions: number
  correctAnswers: number
  avgResponseTime: number
  uniqueTopics: string[]
  perfectSessions: number
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first skill',
    icon: '👶',
    xpReward: 50,
    category: 'learning',
    condition: (stats) => stats.correctAnswers >= 1,
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Answer 50 questions correctly',
    icon: '🔍',
    xpReward: 100,
    category: 'learning',
    condition: (stats) => stats.correctAnswers >= 50,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Answer 200 questions correctly',
    icon: '🎓',
    xpReward: 250,
    category: 'learning',
    condition: (stats) => stats.correctAnswers >= 200,
  },

  // Streak achievements
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 150,
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'dedicated-student',
    name: 'Dedicated Student',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    xpReward: 500,
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 30,
  },

  // Mastery achievements
  {
    id: 'skill-master',
    name: 'Skill Master',
    description: 'Master 10 skills (85%+ knowledge)',
    icon: '⭐',
    xpReward: 200,
    category: 'mastery',
    condition: (stats) => stats.skillsMastered >= 10,
  },
  {
    id: 'course-champion',
    name: 'Course Champion',
    description: 'Complete 5 courses',
    icon: '🏆',
    xpReward: 300,
    category: 'mastery',
    condition: (stats) => stats.coursesCompleted >= 5,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 perfect sessions (100% correct)',
    icon: '💯',
    xpReward: 400,
    category: 'mastery',
    condition: (stats) => stats.perfectSessions >= 10,
  },

  // Speed achievements
  {
    id: 'quick-thinker',
    name: 'Quick Thinker',
    description: 'Average response time under 10 seconds',
    icon: '⚡',
    xpReward: 150,
    category: 'speed',
    condition: (stats) => stats.avgResponseTime > 0 && stats.avgResponseTime < 10000,
  },
  {
    id: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Average response time under 5 seconds',
    icon: '🌩️',
    xpReward: 300,
    category: 'speed',
    condition: (stats) => stats.avgResponseTime > 0 && stats.avgResponseTime < 5000,
  },

  // Exploration achievements
  {
    id: 'curious-mind',
    name: 'Curious Mind',
    description: 'Learn 5 different topics',
    icon: '🌈',
    xpReward: 200,
    category: 'exploration',
    condition: (stats) => stats.uniqueTopics.length >= 5,
  },
  {
    id: 'renaissance-learner',
    name: 'Renaissance Learner',
    description: 'Learn 10 different topics',
    icon: '🎨',
    xpReward: 400,
    category: 'exploration',
    condition: (stats) => stats.uniqueTopics.length >= 10,
  },
]

export function checkNewAchievements(
  stats: UserStats,
  unlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    !unlockedIds.includes(achievement.id) && 
    achievement.condition(stats)
  )
}

export function calculateTotalXP(achievements: Achievement[]): number {
  return achievements.reduce((total, achievement) => total + achievement.xpReward, 0)
}