import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

// Use /tmp in production (Vercel), local cache directory in development
const CACHE_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/coursebuilder-cache'
  : path.join(process.cwd(), 'cache')

// In-memory cache as a fallback and for better performance
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const MEMORY_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Only try to create directory if we can write to filesystem
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
} catch (error) {
  console.warn('[Cache] Unable to create cache directory, using memory-only cache:', error)
}

export function getCacheKey(topic: string): string {
  return createHash('md5').update(topic.toLowerCase()).digest('hex')
}

export function getCachedCourse(topic: string): any | null {
  const key = getCacheKey(topic)
  
  // Check memory cache first
  const memoryCached = memoryCache.get(key)
  if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_TTL) {
    console.log('[Cache] Found in memory cache:', key)
    return memoryCached.data
  }
  
  // Try filesystem cache as fallback
  const filePath = path.join(CACHE_DIR, `${key}.json`)
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(data)
      // Update memory cache
      memoryCache.set(key, { data: parsed, timestamp: Date.now() })
      console.log('[Cache] Found in filesystem cache:', key)
      return parsed
    }
  } catch (error) {
    console.warn('[Cache] Error reading filesystem cache:', error)
  }
  
  return null
}

export function setCachedCourse(topic: string, data: any): void {
  const key = getCacheKey(topic)
  
  // Always set in memory cache
  memoryCache.set(key, { data, timestamp: Date.now() })
  console.log('[Cache] Stored in memory cache:', key)
  
  // Try to persist to filesystem
  const filePath = path.join(CACHE_DIR, `${key}.json`)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log('[Cache] Persisted to filesystem:', key)
  } catch (error) {
    console.warn('[Cache] Unable to persist to filesystem, memory-only:', error)
  }
}

const rateLimitMap = new Map<string, number>()

export function checkRateLimit(identifier: string, limitMs: number = 60000): boolean {
  const now = Date.now()
  const lastCall = rateLimitMap.get(identifier) || 0
  
  if (now - lastCall < limitMs) {
    return false
  }
  
  rateLimitMap.set(identifier, now)
  return true
}