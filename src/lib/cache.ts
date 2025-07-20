import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

const CACHE_DIR = path.join(process.cwd(), 'cache')

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export function getCacheKey(topic: string): string {
  return createHash('md5').update(topic.toLowerCase()).digest('hex')
}

export function getCachedCourse(topic: string): any | null {
  const key = getCacheKey(topic)
  const filePath = path.join(CACHE_DIR, `${key}.json`)
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading cache:', error)
  }
  
  return null
}

export function setCachedCourse(topic: string, data: any): void {
  const key = getCacheKey(topic)
  const filePath = path.join(CACHE_DIR, `${key}.json`)
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing cache:', error)
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