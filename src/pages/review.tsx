import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import QuizCard from '@/components/QuizCard'
import { prisma } from '@/lib/db'
import { getDueSkills, answerToQuality, calculateNextReview } from '@/lib/learnerModel/spacedRepetition'
import { updateKnowledge, getMasteryLevel } from '@/lib/learnerModel/knowledgeTracker'

interface ReviewSession {
  userId: string
  dueSkills: Array<{
    id: string
    skill: {
      id: string
      name: string
      explanation: string
      question: string
      choices: string[]
      correctIndex: number
      questionExplanation: string
      bloomLevel: string
    }
    knowledge: number
    nextReviewAt: Date
    intervalDays: number
    easeFactor: number
  }>
  currentIndex: number
  startTime: number
}

export default function ReviewPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [answeredCount, setAnsweredCount] = useState(0)

  useEffect(() => {
    loadReviewSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviewSession = async () => {
    try {
      const response = await fetch('/api/review/session')
      if (!response.ok) throw new Error('Failed to load review session')
      
      const data = await response.json()
      
      if (data.dueSkills.length === 0) {
        toast.success('No reviews due! Check back later.')
        router.push('/dashboard')
        return
      }

      setSession({
        ...data,
        currentIndex: 0,
        startTime: Date.now(),
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading review session:', error)
      toast.error('Failed to load review session')
      router.push('/')
    }
  }

  const handleAnswer = async (skillId: string, correct: boolean) => {
    if (!session) return

    const skill = session.dueSkills.find(s => s.skill.id === skillId)
    if (!skill) return

    const responseTime = Date.now() - session.startTime
    const quality = answerToQuality(correct, responseTime, 15000) // 15s average

    try {
      await fetch('/api/review/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          skillId,
          correct,
          responseTime,
          quality,
        }),
      })

      setAnsweredCount(prev => prev + 1)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const handleNext = () => {
    if (!session) return

    if (session.currentIndex + 1 < session.dueSkills.length) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
        startTime: Date.now(),
      })
    } else {
      // Review session complete
      toast.success(`Review complete! ${answeredCount} skills reviewed.`)
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading review session...</p>
        </div>
      </div>
    )
  }

  if (!session || session.dueSkills.length === 0) {
    return null
  }

  const currentSkill = session.dueSkills[session.currentIndex]
  const progress = ((session.currentIndex + 1) / session.dueSkills.length) * 100
  const mastery = getMasteryLevel(currentSkill.knowledge)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Review Session</h1>
          <p className="text-gray-600">
            Strengthen your knowledge with spaced repetition
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{session.currentIndex + 1} of {session.dueSkills.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full gradient-bg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Current Skill Info */}
        <motion.div
          key={currentSkill.skill.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{currentSkill.skill.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${mastery.color}-100 text-${mastery.color}-800`}>
                  {mastery.level}
                </span>
                <span className="text-xs text-gray-500">
                  Next review: {currentSkill.intervalDays} days
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Current knowledge: {(currentSkill.knowledge * 100).toFixed(0)}%
            </div>
          </div>

          {/* Quiz Card */}
          <QuizCard
            skill={{
              id: currentSkill.skill.id,
              name: currentSkill.skill.name,
              explanation: currentSkill.skill.explanation,
              quiz: {
                id: currentSkill.skill.id,
                question: currentSkill.skill.question,
                choices: currentSkill.skill.choices,
                correctIndex: currentSkill.skill.correctIndex,
                explanation: currentSkill.skill.questionExplanation,
                bloomLevel: currentSkill.skill.bloomLevel,
              },
            }}
            onComplete={(correct) => handleAnswer(currentSkill.skill.id, correct)}
            onFeedback={() => {}} // Feedback handled differently in review mode
            onAnswered={handleNext}
            isActive={true}
          />
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-blue-50 rounded-lg"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Review Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take your time to recall the answer before selecting</li>
            <li>• The difficulty will adjust based on your performance</li>
            <li>• Regular reviews strengthen long-term retention</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}