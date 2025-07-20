// Bayesian Knowledge Tracing implementation
export interface KnowledgeState {
  skillId: string
  probability: number // P(knows skill)
  correctAttempts: number
  totalAttempts: number
  lastUpdated: Date
}

// BKT parameters (based on research literature)
const BKT_PARAMS = {
  pInit: 0.3,      // P(L0) - Initial probability of knowing
  pLearn: 0.4,     // P(T) - Probability of learning from attempt
  pGuess: 0.2,     // P(G) - Probability of guessing correctly
  pSlip: 0.1,      // P(S) - Probability of slipping (knowing but answering wrong)
}

export function updateKnowledge(
  current: KnowledgeState,
  isCorrect: boolean
): KnowledgeState {
  const { pLearn, pGuess, pSlip } = BKT_PARAMS
  
  // Calculate P(knows | evidence) using Bayes' theorem
  let pKnows = current.probability

  if (isCorrect) {
    // P(knows | correct) = P(correct | knows) * P(knows) / P(correct)
    const pCorrectGivenKnows = 1 - pSlip
    const pCorrectGivenNotKnows = pGuess
    const pCorrect = pCorrectGivenKnows * pKnows + pCorrectGivenNotKnows * (1 - pKnows)
    
    pKnows = (pCorrectGivenKnows * pKnows) / pCorrect
  } else {
    // P(knows | incorrect) = P(incorrect | knows) * P(knows) / P(incorrect)
    const pIncorrectGivenKnows = pSlip
    const pIncorrectGivenNotKnows = 1 - pGuess
    const pIncorrect = pIncorrectGivenKnows * pKnows + pIncorrectGivenNotKnows * (1 - pKnows)
    
    pKnows = (pIncorrectGivenKnows * pKnows) / pIncorrect
  }

  // Update for learning: P(knows after) = P(knows before) + (1 - P(knows before)) * P(learn)
  const pKnowsAfterLearning = pKnows + (1 - pKnows) * pLearn

  return {
    ...current,
    probability: Math.min(0.99, Math.max(0.01, pKnowsAfterLearning)),
    correctAttempts: current.correctAttempts + (isCorrect ? 1 : 0),
    totalAttempts: current.totalAttempts + 1,
    lastUpdated: new Date(),
  }
}

// Calculate mastery level based on knowledge probability
export function getMasteryLevel(probability: number): {
  level: 'novice' | 'learning' | 'competent' | 'proficient' | 'expert'
  color: string
  description: string
} {
  if (probability < 0.3) {
    return {
      level: 'novice',
      color: 'red',
      description: 'Just starting to learn',
    }
  } else if (probability < 0.5) {
    return {
      level: 'learning',
      color: 'orange',
      description: 'Building understanding',
    }
  } else if (probability < 0.7) {
    return {
      level: 'competent',
      color: 'yellow',
      description: 'Solid grasp of basics',
    }
  } else if (probability < 0.85) {
    return {
      level: 'proficient',
      color: 'blue',
      description: 'Strong understanding',
    }
  } else {
    return {
      level: 'expert',
      color: 'green',
      description: 'Mastered this skill',
    }
  }
}

// Estimate time to mastery
export function estimateTimeToMastery(
  current: KnowledgeState,
  targetProbability: number = 0.85
): number {
  if (current.probability >= targetProbability) return 0

  const avgCorrectRate = current.totalAttempts > 0 
    ? current.correctAttempts / current.totalAttempts 
    : 0.5

  // Simple estimation based on current trajectory
  const remainingGap = targetProbability - current.probability
  const expectedGainPerAttempt = BKT_PARAMS.pLearn * (1 - current.probability) * avgCorrectRate
  
  return Math.ceil(remainingGap / expectedGainPerAttempt)
}