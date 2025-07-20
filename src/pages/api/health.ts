import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    version: '1.2.0'
  }
  
  res.status(200).json(health)
}