import Constants from 'expo-constants'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggingConfig {
  level: LogLevel
  enableConsole: boolean
  enablePostHog: boolean
}

function getEnvironment(): 'development' | 'preview' | 'production' {
  // Check explicit environment variable first (most reliable)
  const explicitEnv = process.env.EXPO_PUBLIC_ENVIRONMENT
  if (explicitEnv === 'development' || explicitEnv === 'preview' || explicitEnv === 'production') {
    return explicitEnv
  }
  
  // Fallback to __DEV__ for development
  if (__DEV__) {
    return 'development'
  }
  
  // Default to production for built apps
  return 'production'
}

export function getLoggingConfig(): LoggingConfig {
  const env = getEnvironment()
  
  switch (env) {
    case 'development':
      return {
        level: 'info',
        enableConsole: true,
        enablePostHog: false, // Don't spam PostHog in dev
      }
    case 'preview':
      return {
        level: 'info',
        enableConsole: true,
        enablePostHog: true,
      }
    case 'production':
      return {
        level: 'warn', // Only warnings and errors in prod
        enableConsole: false,
        enablePostHog: true,
      }
    default:
      return {
        level: 'info',
        enableConsole: true,
        enablePostHog: false,
      }
  }
}