const requiredEnvVars = ['OPENAI_API_KEY'] as const

type RequiredEnvVars = typeof requiredEnvVars[number]

function validateEnv(): Record<RequiredEnvVars, string> {
  const missingVars: string[] = []
  const env: Partial<Record<RequiredEnvVars, string>> = {}

  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    if (!value) {
      missingVars.push(varName)
    } else {
      env[varName] = value
    }
  }

  if (missingVars.length > 0) {
    // In production, log the error but don't throw to prevent app crash
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    console.error(errorMessage)
    
    // Return empty values to allow the app to run (with degraded functionality)
    const fallbackEnv: Record<RequiredEnvVars, string> = {} as any
    for (const varName of requiredEnvVars) {
      fallbackEnv[varName] = env[varName] || ''
    }
    return fallbackEnv
  }

  return env as Record<RequiredEnvVars, string>
}

export const env = validateEnv()