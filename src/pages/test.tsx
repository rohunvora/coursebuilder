import Link from 'next/link'

// Simple test page to verify basic functionality
export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>If you can see this, Next.js is working.</p>
      <div className="mt-4 space-y-2">
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>
      <div className="mt-4">
        <Link href="/" className="text-blue-600 underline">
          Go to Home
        </Link>
      </div>
    </div>
  )
}