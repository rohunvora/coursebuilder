import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { MicroSkill } from '@/lib/questionGenerator'

interface QuizCardProps {
  skill: MicroSkill
  onComplete: (correct: boolean) => void
  onFeedback: (skillId: string, rating: 'up' | 'down', comment?: string) => void
  onAnswered: () => void
  isActive: boolean
}

export default function QuizCard({ skill, onComplete, onFeedback, onAnswered, isActive }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [showConfidence, setShowConfidence] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || showResult) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1
        if (index < skill.quiz.choices.length) {
          handleAnswer(index)
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const buttons = cardRef.current?.querySelectorAll('button[data-choice]')
        if (!buttons) return
        
        const currentFocus = document.activeElement
        const currentIndex = Array.from(buttons).indexOf(currentFocus as HTMLButtonElement)
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          (buttons[currentIndex - 1] as HTMLButtonElement).focus()
        } else if (e.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
          (buttons[currentIndex + 1] as HTMLButtonElement).focus()
        } else if (currentIndex === -1) {
          (buttons[0] as HTMLButtonElement).focus()
        }
      } else if (e.key === 'Enter' && document.activeElement?.hasAttribute('data-choice')) {
        const index = parseInt(document.activeElement.getAttribute('data-choice')!)
        handleAnswer(index)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, showResult, skill.quiz.choices.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfidenceSelect = (level: number) => {
    setConfidence(level)
    setShowConfidence(false)
  }

  const handleAnswer = (index: number) => {
    if (showResult) return
    
    if (confidence === null) {
      setShowConfidence(true)
      setSelectedAnswer(index)
      return
    }

    setSelectedAnswer(index)
    setShowResult(true)
    
    const isCorrect = index === skill.quiz.correctIndex
    onComplete(isCorrect)
    
    // Pass confidence data to parent (stored as comment for now)
    // TODO: Add confidence tracking to feedback API
    
    if (isCorrect) {
      toast.success('Correct! +10 XP', { 
        duration: 2000,
        icon: '✨',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      })
    } else {
      toast.error(
        <div>
          <strong>Not quite!</strong>
          <p className="text-sm mt-1">{skill.quiz.explanation}</p>
        </div>,
        { duration: 4000 }
      )
    }

    setTimeout(onAnswered, 1500)
  }

  const handleFeedback = (rating: 'up' | 'down') => {
    if (feedbackOpen && feedbackText.trim()) {
      onFeedback(skill.id, rating, feedbackText)
      toast.success('Feedback submitted!', { duration: 2000 })
      setFeedbackText('')
      setFeedbackOpen(false)
    } else if (!feedbackOpen && rating === 'down') {
      setFeedbackOpen(true)
    } else {
      onFeedback(skill.id, rating)
      toast.success('Thanks for your feedback!', { duration: 2000 })
    }
  }

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold flex-1">{skill.name}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {skill.quiz.bloomLevel}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{skill.explanation}</p>
      
      <div className="mb-4">
        <p className="font-medium mb-3">{skill.quiz.question}</p>
        <div className="space-y-2">
          {skill.quiz.choices.map((choice, index) => (
            <motion.button
              key={index}
              data-choice={index}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                showResult
                  ? index === skill.quiz.correctIndex
                    ? 'bg-green-100 border-green-500'
                    : index === selectedAnswer
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-300'
                  : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }`}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="flex-1">{choice}</span>
              {showResult && index === skill.quiz.correctIndex && (
                <span className="text-green-600">✓</span>
              )}
              {showResult && index === selectedAnswer && index !== skill.quiz.correctIndex && (
                <span className="text-red-600">✗</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {showResult && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t"
        >
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explanation:</strong> {skill.quiz.explanation}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFeedback('up')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Thumbs up"
              >
                👍
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Thumbs down"
              >
                👎
              </button>
            </div>
          </div>
          
          {feedbackOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us why (optional)"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
              <button
                onClick={() => handleFeedback('down')}
                className="mt-2 text-sm bg-gradient-to-r from-indigo-600 to-rose-600 text-white px-4 py-1 rounded-lg hover:from-indigo-700 hover:to-rose-700 transition-all"
              >
                Submit Feedback
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {skill.quiz.criticScore && (
        <div className="mt-2 text-xs text-gray-400 text-right">
          Quality score: {skill.quiz.criticScore}/10
        </div>
      )}

      {/* Confidence Modal */}
      {showConfidence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowConfidence(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">How confident are you?</h3>
            <p className="text-gray-600 mb-6">
              Rate your confidence before seeing if you&apos;re correct
            </p>
            <div className="space-y-3">
              {[
                { level: 1, label: 'Just guessing', color: 'red' },
                { level: 2, label: 'Not very sure', color: 'orange' },
                { level: 3, label: 'Somewhat confident', color: 'yellow' },
                { level: 4, label: 'Pretty confident', color: 'blue' },
                { level: 5, label: 'Very confident', color: 'green' },
              ].map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => {
                    handleConfidenceSelect(level)
                    handleAnswer(selectedAnswer!)
                  }}
                  className={`w-full p-3 rounded-lg border-2 hover:border-${color}-500 hover:bg-${color}-50 transition-all flex items-center justify-between group`}
                >
                  <span className="font-medium">{label}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < level
                            ? `bg-${color}-500`
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}