import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const examples = [
  { title: 'Italian Pasta Shapes', emoji: '🍝' },
  { title: 'Stoic Philosophy', emoji: '🏛️' },
  { title: 'Python Decorators', emoji: '🐍' },
  { title: 'Jazz Theory Basics', emoji: '🎵' },
  { title: 'Japanese Tea Ceremony', emoji: '🍵' },
  { title: 'Blockchain Fundamentals', emoji: '⛓️' },
]

export default function Home() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)

    try {
      // Get or create user
      const userId = localStorage.getItem('userId') || `user-${Date.now()}`
      localStorage.setItem('userId', userId)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.trim(),
          userId 
        })
      })

      if (!response.ok) {
        let errorMessage = 'Unable to create your course right now. Please try again.'
        
        try {
          const error = await response.json()
          // Use the server's error message if it's user-friendly
          if (error.message && !error.message.includes('JSON') && !error.message.includes('undefined')) {
            errorMessage = error.message
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      router.push(`/course/${data.courseId}?generating=true`)
    } catch (error) {
      // Provide user-friendly error messages
      let message = 'Something went wrong. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          message = 'Unable to connect to the server. Please check your internet connection.'
        } else if (error.message.includes('JSON')) {
          message = 'The server returned an invalid response. Please try again.'
        } else {
          message = error.message
        }
      }
      
      toast.error(message)
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setTopic(example)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent">
            Learn Anything in Minutes
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered micro-courses that adapt to your learning style
          </p>
        </motion.div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to learn?"
              className="input-primary text-lg py-4 pr-12"
              disabled={loading}
              autoFocus
            />
            {topic && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary w-full text-lg py-4 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Building your personalized course...
              </span>
            ) : (
              'Start Learning →'
            )}
          </button>
          
          <Link href="/dashboard" className="text-center block mt-4 text-indigo-600 hover:text-indigo-800">
            Go to Dashboard →
          </Link>
        </motion.form>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <p className="text-center text-gray-600 mb-4">Popular topics</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {examples.map((example, idx) => (
              <motion.button
                key={example.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                onClick={() => handleExampleClick(example.title)}
                className="group flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {example.emoji}
                </span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {example.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentExample}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>Try: &quot;{examples[currentExample].title}&quot; {examples[currentExample].emoji}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}