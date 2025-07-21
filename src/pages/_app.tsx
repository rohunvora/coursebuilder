import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import DebugPanel from '@/components/DebugPanel'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize userId on first load
    if (typeof window !== 'undefined') {
      const existingUserId = localStorage.getItem('userId')
      if (!existingUserId) {
        const newUserId = `user-${Date.now()}`
        localStorage.setItem('userId', newUserId)
        console.log('[App] Created initial userId:', newUserId)
      } else {
        console.log('[App] Found existing userId:', existingUserId)
      }
    }
  }, [])

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <DebugPanel />
    </ErrorBoundary>
  )
}