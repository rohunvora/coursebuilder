import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const steps = [
  { text: 'Analyzing topic...', duration: 1000 },
  { text: 'Creating learning path...', duration: 1500 },
  { text: 'Generating questions...', duration: 1500 },
  { text: 'Validating quality...', duration: 1000 },
  { text: 'Finalizing your course...', duration: 1000 },
]

export default function GeneratingLoader() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let totalTime = 0
    const timers: NodeJS.Timeout[] = []

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index)
      }, totalTime)
      timers.push(timer)
      totalTime += step.duration
    })

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + 1
      })
    }, 50)

    // Complete progress when done
    const completeTimer = setTimeout(() => {
      setProgress(100)
    }, totalTime)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(completeTimer)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full mb-4">
              <svg
                className="animate-spin h-10 w-10 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Building Your Course</h2>
            <p className="text-gray-600 mb-6">{steps[currentStep]?.text}</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}