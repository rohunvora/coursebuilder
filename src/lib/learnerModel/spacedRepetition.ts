import { addDays, differenceInDays, startOfDay } from 'date-fns'

export interface RepetitionSchedule {
  lastReviewedAt: Date
  nextReviewAt: Date
  intervalDays: number
  easeFactor: number
  repetitions: number
}

// SuperMemo 2 algorithm parameters
const SM2_PARAMS = {
  initialInterval: 1,
  easyBonus: 1.3,
  minEaseFactor: 1.3,
  maxEaseFactor: 2.5,
}

export type AnswerQuality = 0 | 1 | 2 | 3 | 4 | 5
// 0 - Complete blackout
// 1 - Incorrect, but familiar
// 2 - Incorrect, but easy to recall
// 3 - Correct, but difficult
// 4 - Correct, after hesitation
// 5 - Perfect response

export function calculateNextReview(
  current: RepetitionSchedule,
  quality: AnswerQuality
): RepetitionSchedule {
  let { intervalDays, easeFactor, repetitions } = current

  // Update ease factor
  easeFactor = Math.max(
    SM2_PARAMS.minEaseFactor,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  if (quality < 3) {
    // Failed - reset to beginning
    repetitions = 0
    intervalDays = 1
  } else {
    // Passed - calculate next interval
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }

    repetitions += 1

    // Apply easy bonus for perfect responses
    if (quality === 5) {
      intervalDays = Math.round(intervalDays * SM2_PARAMS.easyBonus)
    }
  }

  // Cap maximum interval at 180 days
  intervalDays = Math.min(180, intervalDays)

  return {
    lastReviewedAt: new Date(),
    nextReviewAt: addDays(startOfDay(new Date()), intervalDays),
    intervalDays,
    easeFactor: Math.min(SM2_PARAMS.maxEaseFactor, easeFactor),
    repetitions,
  }
}

// Get skills due for review
export function getDueSkills(
  skills: Array<{ id: string; nextReviewAt: Date }>,
  now: Date = new Date()
): string[] {
  return skills
    .filter(skill => skill.nextReviewAt <= now)
    .map(skill => skill.id)
}

// Calculate review priority (lower = more urgent)
export function getReviewPriority(schedule: RepetitionSchedule): number {
  const daysOverdue = differenceInDays(new Date(), schedule.nextReviewAt)
  const urgency = daysOverdue > 0 ? daysOverdue * 2 : 0
  
  // Prioritize items with shorter intervals (they're more fragile)
  return -urgency + schedule.intervalDays / 10
}

// Estimate retention probability using forgetting curve
export function estimateRetention(
  lastReview: Date,
  intervalDays: number,
  easeFactor: number
): number {
  const daysSinceReview = differenceInDays(new Date(), lastReview)
  const stabilityFactor = intervalDays * easeFactor
  
  // Exponential forgetting curve
  const retention = Math.exp(-daysSinceReview / stabilityFactor)
  
  return Math.max(0.1, Math.min(1, retention))
}

// Convert answer correctness and time to SM2 quality
export function answerToQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  avgResponseTimeMs: number
): AnswerQuality {
  if (!isCorrect) {
    return responseTimeMs < avgResponseTimeMs * 0.5 ? 2 : 1
  }

  const timeRatio = responseTimeMs / avgResponseTimeMs

  if (timeRatio < 0.7) return 5      // Very fast - perfect
  if (timeRatio < 1.0) return 4      // Normal speed - good
  if (timeRatio < 1.5) return 3      // Slow - acceptable
  return 3                            // Very slow but correct
}