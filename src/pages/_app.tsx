import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import DebugPanel from '@/components/DebugPanel'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <DebugPanel />
    </ErrorBoundary>
  )
}