import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { calculateStreak, getStreakMessage } from '@/lib/gamification/streaks'
import { checkNewAchievements } from '@/lib/gamification/achievements'
import { format, subDays, startOfDay } from 'date-fns'

interface DashboardData {
  user: {
    id: string
    totalXP: number
    currentStreak: number
    coursesCompleted: number
  }
  recentCourses: Array<{
    id: string
    title: string
    progress: number
    lastActivity: string
  }>
  dueReviews: number
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
  }>
  analytics: {
    learningProgress: Array<{
      date: string
      xp: number
      questionsAnswered: number
      accuracy: number
    }>
    skillMastery: Array<{
      skill: string
      knowledge: number
      attempts: number
    }>
    timeDistribution: Array<{
      name: string
      value: number
    }>
    bloomLevels: Array<{
      level: string
      mastery: number
    }>
    streakHistory: Array<{
      date: string
      completed: boolean
    }>
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'achievements'>('overview')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId')
      if (!userId) {
        // Create a new user if none exists
        const newUserId = `user-${Date.now()}`
        localStorage.setItem('userId', newUserId)
      }
      
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'x-user-id': userId || `user-${Date.now()}`
        }
      })
      if (!response.ok) throw new Error('Failed to load dashboard')
      
      const dashboardData = await response.json()
      setData(dashboardData)
      setLoading(false)

      // Check for new achievements
      if (dashboardData.newAchievements?.length > 0) {
        dashboardData.newAchievements.forEach((achievement: any) => {
          toast.success(
            <div>
              <strong>Achievement Unlocked!</strong>
              <p>{achievement.icon} {achievement.name}</p>
            </div>,
            { duration: 5000 }
          )
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <Link href="/" className="btn-primary">
            Start Learning
          </Link>
        </div>
      </div>
    )
  }

  const streakInfo = {
    currentStreak: data.user.currentStreak,
    todayCompleted: data.analytics.streakHistory[0]?.completed || false,
  }
  const streakMessage = getStreakMessage({
    currentStreak: data.user.currentStreak,
    longestStreak: data.user.currentStreak,
    lastActiveDate: new Date(),
    todayCompleted: streakInfo.todayCompleted,
    streakBroken: false,
  })

  const accuracy = data.analytics.learningProgress.length > 0
    ? Math.round(
        data.analytics.learningProgress.reduce((sum, day) => sum + day.accuracy, 0) / 
        data.analytics.learningProgress.length
      )
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold gradient-text">Your Learning Dashboard</h1>
            <Link href="/" className="btn-primary">
              New Course
            </Link>
          </div>
          
          {/* Streak Banner */}
          <div className={`p-4 rounded-lg bg-${streakMessage.color}-100 border border-${streakMessage.color}-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{streakMessage.emoji}</span>
                <div>
                  <p className={`font-semibold text-${streakMessage.color}-800`}>
                    {streakMessage.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep learning every day to maintain your streak!
                  </p>
                </div>
              </div>
              {data.dueReviews > 0 && (
                <Link href="/review" className="btn-primary">
                  {data.dueReviews} Reviews Due
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['overview', 'analytics', 'achievements'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center"
              >
                <h3 className="text-sm text-gray-600 mb-1">Total XP</h3>
                <p className="text-3xl font-bold gradient-text">{data.user.totalXP}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card text-center"
              >
                <h3 className="text-sm text-gray-600 mb-1">Courses Completed</h3>
                <p className="text-3xl font-bold text-green-600">{data.user.coursesCompleted}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card text-center"
              >
                <h3 className="text-sm text-gray-600 mb-1">Achievements</h3>
                <p className="text-3xl font-bold text-purple-600">{data.achievements.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="card text-center"
              >
                <h3 className="text-sm text-gray-600 mb-1">Reviews Due</h3>
                <p className="text-3xl font-bold text-orange-600">{data.dueReviews}</p>
              </motion.div>
            </div>

            {/* Recent Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
              {data.recentCourses.length > 0 ? (
                <div className="space-y-3">
                  {data.recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/course/${course.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">
                            Last activity: {format(new Date(course.lastActivity), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">{course.progress}% complete</div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-full gradient-bg rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No courses started yet. Begin your learning journey!</p>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            data={data.analytics}
            totalXP={data.user.totalXP}
            currentStreak={data.user.currentStreak}
            accuracy={accuracy}
          />
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="card"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}