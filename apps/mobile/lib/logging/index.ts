import PostHog from 'posthog-react-native'
import { getPostHog } from '../posthog'
import { getLoggingConfig, type LogLevel } from './config'

export interface LoggerMeta {
  userId?: string
  functionName?: string
  component?: string
  [key: string]: any
}

export interface Logger {
  debug(message: string, meta?: Record<string, any>): void
  info(message: string, meta?: Record<string, any>): void
  warn(message: string, meta?: Record<string, any>): void
  error(message: string, meta?: Record<string, any>): void
}

class MobileLogger implements Logger {
  private posthog: PostHog | null
  private config = getLoggingConfig()
  private meta: LoggerMeta

  constructor(meta: LoggerMeta = {}) {
    this.posthog = getPostHog()
    this.meta = meta
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }
    return levels[level] >= levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const context = this.meta.component || this.meta.functionName
    return context ? `${prefix} [${context}] ${message}` : `${prefix} ${message}`
  }

  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    if (!this.shouldLog(level)) return

    const combinedMeta = { ...this.meta, ...meta, logLevel: level }
    const formattedMessage = this.formatMessage(level, message)

    // Console logging
    if (this.config.enableConsole) {
      const logFn = level === 'error' ? console.error : 
                   level === 'warn' ? console.warn : 
                   level === 'info' ? console.info : console.log
      logFn(formattedMessage, combinedMeta)
    }

    // PostHog logging for important events
    if (this.config.enablePostHog && this.posthog && level !== 'debug') {
      this.posthog.capture('mobile_log', {
        level,
        message,
        ...combinedMeta,
        timestamp: new Date().toISOString(),
      })
    }
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta)
  }

  // Create a child logger with additional metadata
  child(additionalMeta: LoggerMeta): Logger {
    return new MobileLogger({ ...this.meta, ...additionalMeta })
  }
}

// Global logger instance
let globalLogger: Logger | null = null

export function createLogger(meta: LoggerMeta = {}): Logger {
  return new MobileLogger(meta)
}

export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = createLogger()
  }
  return globalLogger
}

export function setGlobalLogger(logger: Logger) {
  globalLogger = logger
}

// Convenience function to create component-specific loggers
export function createComponentLogger(componentName: string, additionalMeta: LoggerMeta = {}): Logger {
  return createLogger({ component: componentName, ...additionalMeta })
}