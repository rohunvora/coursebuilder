// Configuration management for Course Builder

export const config = {
  // API endpoints
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Debug settings
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  testMode: process.env.NEXT_PUBLIC_TEST_MODE === 'true',
  
  // Feature flags
  features: {
    achievements: process.env.NEXT_PUBLIC_ENABLE_ACHIEVEMENTS === 'true',
    spacedRepetition: process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === 'true',
    confidenceTracking: process.env.NEXT_PUBLIC_ENABLE_CONFIDENCE_TRACKING === 'true',
  },
  
  // Analytics
  analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL || '',
  
  // Test users
  testUsers: {
    beginner: 'test-user-beginner',
    intermediate: 'test-user-intermediate',
    advanced: 'test-user-advanced',
  }
};

// Helper to get full API URL
export function getApiUrl(path: string) {
  const base = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Helper to check if running in production
export const isProduction = process.env.NODE_ENV === 'production';

// Helper to check if running on Vercel
export const isVercel = process.env.VERCEL === '1';

// Log configuration (only in debug mode)
if (config.debugMode && typeof window !== 'undefined') {
  console.log('[Course Builder] Configuration loaded:', {
    apiUrl: config.apiUrl,
    debugMode: config.debugMode,
    testMode: config.testMode,
    features: config.features,
    environment: isProduction ? 'production' : 'development',
    isVercel,
  });
}