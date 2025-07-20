export interface SkillDifficulty {
  skillName: string
  difficulty: number // 1-10
  prerequisites: number[] // indices of prerequisite skills
  bloomLevel: string
}

// Map skills to Bloom's taxonomy levels with appropriate difficulty
export function planCurriculum(skills: string[]): SkillDifficulty[] {
  const bloomProgression = [
    { level: 'Remember', baseDifficulty: 1 },
    { level: 'Understand', baseDifficulty: 2 },
    { level: 'Apply', baseDifficulty: 3 },
    { level: 'Apply', baseDifficulty: 4 },
    { level: 'Analyze', baseDifficulty: 5 },
    { level: 'Analyze', baseDifficulty: 6 },
    { level: 'Evaluate', baseDifficulty: 7 },
  ]

  return skills.map((skill, index) => {
    const bloom = bloomProgression[Math.min(index, bloomProgression.length - 1)]
    
    // Skills build on previous ones
    const prerequisites = index > 0 ? [index - 1] : []
    if (index > 3) {
      // Advanced skills may require multiple prerequisites
      prerequisites.push(Math.floor(index / 2))
    }

    return {
      skillName: skill,
      difficulty: bloom.baseDifficulty + (index * 0.3),
      prerequisites: prerequisites,
      bloomLevel: bloom.level,
    }
  })
}

// Calculate optimal learning path considering prerequisites
export function getOptimalPath(curriculum: SkillDifficulty[]): number[] {
  const completed = new Set<number>()
  const path: number[] = []

  function canLearn(skillIndex: number): boolean {
    const skill = curriculum[skillIndex]
    return skill.prerequisites.every(p => completed.has(p))
  }

  while (path.length < curriculum.length) {
    // Find all learnable skills
    const learnable = curriculum
      .map((_, index) => index)
      .filter(i => !completed.has(i) && canLearn(i))

    if (learnable.length === 0) {
      // This shouldn't happen with valid prerequisites
      break
    }

    // Choose the easiest learnable skill
    const next = learnable.reduce((easiest, current) => 
      curriculum[current].difficulty < curriculum[easiest].difficulty ? current : easiest
    )

    path.push(next)
    completed.add(next)
  }

  return path
}