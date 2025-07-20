import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import QuizCard from '@/components/QuizCard'
import XPBar from '@/components/XPBar'
import SkeletonLoader from '@/components/SkeletonLoader'
import GeneratingLoader from '@/components/GeneratingLoader'
import CompletionModal from '@/components/CompletionModal'
import { Course } from '@/lib/questionGenerator'

const tourSteps: Step[] = [
  {
    target: '.xp-bar',
    content: 'Track your progress here! Earn 10 XP for each correct answer.',
    placement: 'bottom',
  },
  {
    target: '.quiz-card-0',
    content: 'Answer questions to test your knowledge. Use number keys 1-4 or click to select.',
    placement: 'top',
  },
  {
    target: '.feedback-section',
    content: 'Help us improve by rating each question after you answer.',
    placement: 'top',
  },
]

export default function CoursePage() {
  const router = useRouter()
  const { courseId } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentXP, setCurrentXP] = useState(0)
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set())
  const [activeCard, setActiveCard] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!courseId) return

    if (router.query.generating === 'true') {
      setGenerating(true)
      setTimeout(() => {
        setGenerating(false)
        setLoading(true)
      }, 3000)
    }

    fetch(`/api/course/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Course not found')
        return res.json()
      })
      .then(data => {
        setCourse(data)
        setLoading(false)
        
        // Start tour for first-time users
        const hasSeenTour = localStorage.getItem('hasSeenTour')
        if (!hasSeenTour) {
          setTimeout(() => setRunTour(true), 500)
        }
      })
      .catch(error => {
        console.error(error)
        toast.error('Course not found')
        router.push('/')
      })
  }, [courseId, router])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('hasSeenTour', 'true')
      setRunTour(false)
    }
  }

  const handleComplete = (skillId: string, correct: boolean) => {
    if (correct && !completedSkills.has(skillId)) {
      setCurrentXP(prev => prev + 10)
      setCompletedSkills(prev => new Set(Array.from(prev).concat(skillId)))
    }
  }

  const handleAnswered = () => {
    if (!course) return
    
    const nextCard = activeCard + 1
    if (nextCard < course.microSkills.length) {
      setActiveCard(nextCard)
      
      // Smooth scroll to next card
      setTimeout(() => {
        const cards = cardsRef.current?.querySelectorAll('.quiz-card')
        if (cards && cards[nextCard]) {
          cards[nextCard].scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    } else if (completedSkills.size === course.microSkills.length) {
      setShowCompletion(true)
    }
  }

  const handleFeedback = async (skillId: string, rating: 'up' | 'down', comment?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          skillId,
          rating,
          comment,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  if (generating) {
    return <GeneratingLoader />
  }

  if (loading) {
    return <SkeletonLoader />
  }

  if (!course) {
    return null
  }

  const maxXP = course.microSkills.length * 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={tourSteps}
        styles={{
          options: {
            primaryColor: '#6366f1',
          },
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block transition-colors">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold mb-4 gradient-text">{course.title}</h1>
          <div className="mb-6 xp-bar">
            <XPBar currentXP={currentXP} maxXP={maxXP} />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{completedSkills.size} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>{course.microSkills.length - completedSkills.size} remaining</span>
            </div>
          </div>
        </motion.div>

        <div ref={cardsRef} className="space-y-6">
          {course.microSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`quiz-card quiz-card-${index} ${
                index === 0 ? 'feedback-section' : ''
              }`}
            >
              <QuizCard
                skill={skill}
                onComplete={(correct) => handleComplete(skill.id, correct)}
                onFeedback={handleFeedback}
                onAnswered={handleAnswered}
                isActive={index === activeCard}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        courseTitle={course.title}
        totalXP={currentXP}
      />
    </div>
  )
}