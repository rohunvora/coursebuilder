import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    openai: {
      configured: false,
      keyPresent: false,
      keyLength: 0,
      testResult: null as any,
    },
    database: {
      configured: false,
      urlPresent: false,
      connectionTest: null as any,
    },
    api: {
      headers: req.headers,
      method: req.method,
      query: req.query,
    },
    features: {
      debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
      testMode: process.env.NEXT_PUBLIC_TEST_MODE === 'true',
    },
    errors: [] as string[],
  }

  // Check OpenAI configuration
  try {
    const apiKey = process.env.OPENAI_API_KEY
    diagnostics.openai.keyPresent = !!apiKey
    diagnostics.openai.keyLength = apiKey?.length || 0
    
    if (apiKey) {
      diagnostics.openai.configured = true
      // Try a simple API call
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say "working"' }],
        max_tokens: 10,
      })
      diagnostics.openai.testResult = {
        success: true,
        model: completion.model,
        response: completion.choices[0]?.message?.content,
      }
    } else {
      diagnostics.errors.push('OPENAI_API_KEY not set')
    }
  } catch (error) {
    diagnostics.openai.testResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
    diagnostics.errors.push(`OpenAI test failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Check database configuration
  try {
    const dbUrl = process.env.DATABASE_URL
    diagnostics.database.urlPresent = !!dbUrl
    
    if (dbUrl) {
      diagnostics.database.configured = true
      // Try a simple query
      const userCount = await prisma.user.count()
      const courseCount = await prisma.course.count()
      diagnostics.database.connectionTest = {
        success: true,
        userCount,
        courseCount,
      }
    } else {
      diagnostics.errors.push('DATABASE_URL not set')
    }
  } catch (error) {
    diagnostics.database.connectionTest = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
    diagnostics.errors.push(`Database test failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Return diagnostics
  res.status(200).json({
    ...diagnostics,
    summary: {
      healthy: diagnostics.errors.length === 0,
      criticalErrors: diagnostics.errors.filter(e => 
        e.includes('OPENAI_API_KEY') || e.includes('DATABASE_URL')
      ),
      warnings: diagnostics.errors.filter(e => 
        !e.includes('OPENAI_API_KEY') && !e.includes('DATABASE_URL')
      ),
    },
    recommendations: [
      !diagnostics.openai.keyPresent && 'Set OPENAI_API_KEY in Vercel environment variables',
      !diagnostics.database.urlPresent && 'Set DATABASE_URL in Vercel environment variables',
      diagnostics.openai.testResult?.error?.includes('rate limit') && 'OpenAI rate limit exceeded - wait a moment',
      diagnostics.database.connectionTest?.error?.includes('P1001') && 'Database connection failed - check DATABASE_URL',
    ].filter(Boolean),
  })
}