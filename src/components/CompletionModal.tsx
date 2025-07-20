import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface CompletionModalProps {
  isOpen: boolean
  onClose: () => void
  courseTitle: string
  totalXP: number
}

export default function CompletionModal({
  isOpen,
  onClose,
  courseTitle,
  totalXP,
}: CompletionModalProps) {
  const router = useRouter()

  React.useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#f43f5e'],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#f43f5e'],
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  const handleShare = () => {
    const url = window.location.href
    const text = `I just completed "${courseTitle}" and earned ${totalXP} XP! 🎉`
    
    if (navigator.share) {
      navigator.share({
        title: 'Course Completed!',
        text,
        url,
      }).catch(() => {
        // User cancelled share
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleNewCourse = () => {
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full mb-6"
                >
                  <span className="text-5xl">🎉</span>
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  You&apos;ve mastered &quot;{courseTitle}&quot;
                </p>
                
                <div className="bg-gradient-to-r from-indigo-50 to-rose-50 rounded-xl p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-800">
                    Total XP Earned: {totalXP}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleShare}
                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-rose-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-rose-700 transition-all"
                  >
                    Share Achievement 🚀
                  </button>
                  
                  <button
                    onClick={handleNewCourse}
                    className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-all"
                  >
                    Build Another Course
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}