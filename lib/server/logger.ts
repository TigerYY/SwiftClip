export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  requestId?: string
  userId?: string
  context?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
  performance?: {
    duration: number
    memoryUsage: number
  }
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  filePath?: string
  maxFileSize?: number
  maxFiles?: number
}

export class Logger {
  private static instance: Logger
  private config: LoggerConfig

  private constructor(config: LoggerConfig) {
    this.config = config
  }

  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      const defaultConfig: LoggerConfig = {
        level: LogLevel.INFO,
        enableConsole: true,
        enableFile: false,
      }
      Logger.instance = new Logger(config || defaultConfig)
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, requestId, context, error, performance } = entry
    
    let logString = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (requestId) {
      logString += ` [${requestId}]`
    }
    
    logString += ` ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logString += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      logString += ` | Error: ${error.name}: ${error.message}`
      if (error.stack) {
        logString += `\nStack: ${error.stack}`
      }
    }
    
    if (performance) {
      logString += ` | Performance: ${performance.duration}ms, Memory: ${performance.memoryUsage}MB`
    }
    
    return logString
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return
    }

    const formattedLog = this.formatLogEntry(entry)

    if (this.config.enableConsole) {
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formattedLog)
          break
        case LogLevel.INFO:
          console.info(formattedLog)
          break
        case LogLevel.WARN:
          console.warn(formattedLog)
          break
        case LogLevel.ERROR:
          console.error(formattedLog)
          break
      }
    }

    // TODO: 实现文件日志记录
    if (this.config.enableFile && this.config.filePath) {
      // 这里可以实现文件写入逻辑
      // 考虑使用 fs.appendFile 或日志轮转库
    }
  }

  debug(message: string, context?: Record<string, any>, requestId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
      requestId,
    })
  }

  info(message: string, context?: Record<string, any>, requestId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      requestId,
    })
  }

  warn(message: string, context?: Record<string, any>, requestId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
      requestId,
    })
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    requestId?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      requestId,
    }

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    this.writeLog(logEntry)
  }

  performance(
    message: string,
    duration: number,
    memoryUsage?: number,
    context?: Record<string, any>,
    requestId?: string
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      requestId,
      performance: {
        duration,
        memoryUsage: memoryUsage || process.memoryUsage().heapUsed / 1024 / 1024,
      },
    })
  }
}

// 创建默认日志实例
export const logger = Logger.getInstance({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
})

// 性能监控装饰器
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now()
    const startMemory = process.memoryUsage().heapUsed / 1024 / 1024

    try {
      const result = await method.apply(this, args)
      const duration = Date.now() - startTime
      const endMemory = process.memoryUsage().heapUsed / 1024 / 1024

      logger.performance(
        `Method ${propertyName} completed`,
        duration,
        endMemory - startMemory,
        { method: propertyName, args: args.length }
      )

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        `Method ${propertyName} failed`,
        error as Error,
        { method: propertyName, duration }
      )
      throw error
    }
  }

  return descriptor
}