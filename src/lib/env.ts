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
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please copy .env.example to .env and fill in the values.`
    )
  }

  return env as Record<RequiredEnvVars, string>
}

export const env = validateEnv()