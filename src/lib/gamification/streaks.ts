import { startOfDay, differenceInDays, subDays } from 'date-fns'

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date | null
  todayCompleted: boolean
  streakBroken: boolean
}

export function calculateStreak(activityDates: Date[]): StreakInfo {
  if (activityDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      todayCompleted: false,
      streakBroken: false,
    }
  }

  // Sort dates in descending order and normalize to start of day
  const normalizedDates = activityDates
    .map(date => startOfDay(date))
    .sort((a, b) => b.getTime() - a.getTime())

  const today = startOfDay(new Date())
  const lastActive = normalizedDates[0]
  const daysSinceLastActive = differenceInDays(today, lastActive)

  // Check if streak is broken
  const streakBroken = daysSinceLastActive > 1

  // Calculate current streak
  let currentStreak = 0
  let checkDate = today

  // If active today, start counting from today
  if (daysSinceLastActive === 0) {
    currentStreak = 1
    checkDate = subDays(today, 1)
  } else if (daysSinceLastActive === 1) {
    // If active yesterday, start counting from yesterday
    currentStreak = 1
    checkDate = subDays(today, 2)
  }

  // Count consecutive days backwards
  for (const date of normalizedDates.slice(daysSinceLastActive === 0 ? 1 : 0)) {
    if (differenceInDays(checkDate, date) === 0) {
      currentStreak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = currentStreak
  let tempStreak = 1
  
  for (let i = 1; i < normalizedDates.length; i++) {
    const daysDiff = differenceInDays(normalizedDates[i - 1], normalizedDates[i])
    
    if (daysDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return {
    currentStreak: streakBroken ? 0 : currentStreak,
    longestStreak,
    lastActiveDate: lastActive,
    todayCompleted: daysSinceLastActive === 0,
    streakBroken,
  }
}

export function getStreakMessage(streak: StreakInfo): {
  message: string
  emoji: string
  color: string
} {
  if (streak.currentStreak === 0) {
    if (streak.streakBroken) {
      return {
        message: 'Streak broken! Start a new one today',
        emoji: '💔',
        color: 'red',
      }
    }
    return {
      message: 'Start your learning streak today!',
      emoji: '🌱',
      color: 'gray',
    }
  }

  if (streak.currentStreak === 1) {
    return {
      message: 'Great start! Keep it up tomorrow',
      emoji: '✨',
      color: 'green',
    }
  }

  if (streak.currentStreak < 7) {
    return {
      message: `${streak.currentStreak} day streak!`,
      emoji: '🔥',
      color: 'orange',
    }
  }

  if (streak.currentStreak < 30) {
    return {
      message: `${streak.currentStreak} day streak! You're on fire!`,
      emoji: '🔥',
      color: 'orange',
    }
  }

  return {
    message: `${streak.currentStreak} day streak! Incredible dedication!`,
    emoji: '🌟',
    color: 'gold',
  }
}

export function getMotivationalMessage(streak: number): string {
  const messages = [
    'Every expert was once a beginner',
    'Small steps daily lead to big changes',
    'Learning is a journey, not a destination',
    'Consistency beats perfection',
    'Your future self will thank you',
    'Knowledge compounds like interest',
    'Progress, not perfection',
    'The best time to plant a tree was 20 years ago. The second best time is now.',
  ]

  // Use streak as seed for consistent daily message
  const index = streak % messages.length
  return messages[index]
}