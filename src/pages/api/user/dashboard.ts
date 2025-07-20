import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { subDays, startOfDay, format } from 'date-fns'
import { calculateStreak } from '@/lib/gamification/streaks'
import { checkNewAchievements, ACHIEVEMENTS } from '@/lib/gamification/achievements'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // For demo, use a default user ID
  const userId = req.headers['x-user-id'] as string || 'demo-user'

  try {
    // Get or create user
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: {
          include: {
            course: {
              include: {
                microSkills: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
        skills: {
          include: {
            skill: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        dailyStreaks: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { id: userId },
        include: {
          courses: {
            include: {
              course: {
                include: {
                  microSkills: true,
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          achievements: {
            include: {
              achievement: true,
            },
          },
          dailyStreaks: true,
        },
      })
    }

    // Ensure user is not null for the rest of the function
    const userData = user!

    // Calculate total XP
    const totalXP = userData.skills.reduce((sum, skill) => 
      sum + (skill.correctAttempts * 10), 0
    )

    // Calculate streak
    const streakDates = userData.dailyStreaks
      .filter(s => s.completed)
      .map(s => s.date)
    const streakInfo = calculateStreak(streakDates)

    // Get due reviews
    const dueReviews = userData.skills.filter(skill => 
      skill.nextReviewAt <= new Date()
    ).length

    // Transform recent courses
    const recentCourses = userData.courses.map(uc => {
      const totalSkills = uc.course.microSkills.length
      const completedSkills = userData.skills.filter(s => 
        uc.course.microSkills.some(ms => ms.id === s.skillId) &&
        s.knowledgeProb > 0.85
      ).length

      return {
        id: uc.course.id,
        title: uc.course.title,
        progress: Math.round((completedSkills / totalSkills) * 100),
        lastActivity: uc.startedAt.toISOString(),
      }
    })

    // Calculate analytics data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i))
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const daySkills = userData.skills.filter(s => 
        format(s.lastReviewedAt, 'yyyy-MM-dd') === dateStr
      )

      return {
        date: dateStr,
        xp: daySkills.reduce((sum, s) => sum + (s.correctAttempts * 10), 0),
        questionsAnswered: daySkills.reduce((sum, s) => sum + s.totalAttempts, 0),
        accuracy: daySkills.length > 0
          ? Math.round(
              daySkills.reduce((sum, s) => 
                sum + (s.correctAttempts / Math.max(1, s.totalAttempts)), 0
              ) / daySkills.length * 100
            )
          : 0,
      }
    })

    // Skill mastery data
    const skillMastery = userData.skills
      .slice(0, 10)
      .map(us => ({
        skill: us.skill.name,
        knowledge: us.knowledgeProb,
        attempts: us.totalAttempts,
      }))

    // Time distribution (mock data for demo)
    const timeDistribution = [
      { name: 'Morning', value: 30 },
      { name: 'Afternoon', value: 45 },
      { name: 'Evening', value: 25 },
    ]

    // Bloom levels progress
    const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate']
    const bloomProgress = bloomLevels.map(level => {
      const levelSkills = userData.skills.filter(s => 
        s.skill.bloomLevel === level
      )
      const avgMastery = levelSkills.length > 0
        ? levelSkills.reduce((sum, s) => sum + s.knowledgeProb, 0) / levelSkills.length
        : 0

      return {
        level,
        mastery: Math.round(avgMastery * 100),
      }
    })

    // Streak history
    const streakHistory = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i))
      const streak = userData.dailyStreaks.find(s => 
        format(s.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )

      return {
        date: format(date, 'yyyy-MM-dd'),
        completed: streak?.completed || false,
      }
    })

    // Check for new achievements
    const unlockedIds = userData.achievements.map(a => a.achievementId)
    const stats = {
      totalXP,
      coursesCompleted: userData.courses.filter(c => c.completedAt).length,
      skillsMastered: userData.skills.filter(s => s.knowledgeProb > 0.85).length,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      totalQuestions: userData.skills.reduce((sum, s) => sum + s.totalAttempts, 0),
      correctAnswers: userData.skills.reduce((sum, s) => sum + s.correctAttempts, 0),
      avgResponseTime: userData.skills.reduce((sum, s) => sum + s.avgResponseTime, 0) / Math.max(1, userData.skills.length),
      uniqueTopics: Array.from(new Set(userData.courses.map(c => c.course.topic))),
      perfectSessions: 0, // Would need session tracking
    }

    const newAchievements = checkNewAchievements(stats, unlockedIds)

    // Unlock new achievements
    if (newAchievements.length > 0) {
      await prisma.userAchievement.createMany({
        data: newAchievements.map(a => ({
          userId,
          achievementId: a.id,
        })),
      })
    }

    const response = {
      user: {
        id: userId,
        totalXP,
        currentStreak: streakInfo.currentStreak,
        coursesCompleted: stats.coursesCompleted,
      },
      recentCourses,
      dueReviews,
      achievements: userData.achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
      newAchievements,
      analytics: {
        learningProgress: last7Days,
        skillMastery,
        timeDistribution,
        bloomLevels: bloomProgress,
        streakHistory,
      },
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return res.status(500).json({ message: 'Failed to load dashboard' })
  }
}