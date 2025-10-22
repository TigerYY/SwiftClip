import { NextResponse } from 'next/server'
import { logger } from './logger'

// 错误类型枚举
export enum ErrorCode {
  // 验证错误 (400)
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',

  // 资源不存在错误 (404)
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // 业务逻辑错误 (422)
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  CONCURRENT_PROCESSING = 'CONCURRENT_PROCESSING',

  // 系统错误 (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  FILESYSTEM_ERROR = 'FILESYSTEM_ERROR',
}

// 标准化API错误接口
export interface ApiError {
  code: ErrorCode
  message: string
  details?: Record<string, any>
  statusCode: number
}

// 标准化API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
  requestId: string
}

// 自定义错误类
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(code: ErrorCode, message: string, statusCode: number, details?: Record<string, any>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// 预定义的错误创建函数
export class ErrorFactory {
  static validationError(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.INVALID_PARAMETERS, message, 400, details)
  }

  static fileNotFound(filename: string): AppError {
    return new AppError(ErrorCode.FILE_NOT_FOUND, `文件不存在: ${filename}`, 404, { filename })
  }

  static processingFailed(stage: string, reason: string): AppError {
    return new AppError(ErrorCode.PROCESSING_FAILED, `处理失败: ${reason}`, 422, { stage, reason })
  }

  static internalError(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details)
  }
}

// 错误处理器
export class ErrorHandler {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static handle(error: unknown, requestId?: string): ApiError {
    const id = requestId || this.generateRequestId()

    // 使用结构化日志记录错误
    if (error instanceof AppError) {
      logger.error('Application error occurred', error, { errorCode: error.code }, id)
    } else if (error instanceof Error) {
      logger.error('Unexpected error occurred', error, {}, id)
    } else {
      logger.error('Unknown error occurred', undefined, { error: String(error) }, id)
    }

    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
      }
    }

    if (error instanceof Error) {
      // 处理已知的Node.js错误
      if (error.message.includes('ENOENT')) {
        return {
          code: ErrorCode.FILE_NOT_FOUND,
          message: '文件不存在',
          statusCode: 404,
        }
      }

      if (error.message.includes('ENOSPC')) {
        return {
          code: ErrorCode.INSUFFICIENT_STORAGE,
          message: '存储空间不足',
          statusCode: 422,
        }
      }

      // 其他未知错误
      return {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: '服务器内部错误',
        details: { originalMessage: error.message },
        statusCode: 500,
      }
    }

    // 处理非Error对象
    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: '未知错误',
      details: { error: String(error) },
      statusCode: 500,
    }
  }

  static createResponse(apiError: ApiError, requestId?: string): NextResponse {
    const id = requestId || this.generateRequestId()

    const response: ApiResponse = {
      success: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      },
      timestamp: new Date().toISOString(),
      requestId: id,
    }

    return NextResponse.json(response, { status: apiError.statusCode })
  }

  static createSuccessResponse<T>(data: T, requestId?: string): NextResponse {
    const id = requestId || this.generateRequestId()

    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: id,
    }

    return NextResponse.json(response)
  }
}

// 输入验证工具
export class InputValidator {
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件类型: ${file.type}。支持的类型: ${allowedTypes.join(', ')}`,
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `文件大小超出限制。最大允许: ${maxSize / 1024 / 1024}MB，当前: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      }
    }

    return { isValid: true }
  }

  static validateFilename(filename: string): { isValid: boolean; error?: string } {
    // 检查文件名安全性
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
    if (dangerousChars.test(filename)) {
      return {
        isValid: false,
        error: '文件名包含不安全字符',
      }
    }

    // 检查文件名长度
    if (filename.length > 255) {
      return {
        isValid: false,
        error: '文件名过长',
      }
    }

    return { isValid: true }
  }

  static validateProcessingOptions(options: any): {
    isValid: boolean
    error?: string
    validOptions?: any
  } {
    const validOptions: any = {}

    // 验证目标时长
    if (options.targetDuration !== undefined) {
      const duration = Number(options.targetDuration)
      if (isNaN(duration) || duration < 30 || duration > 3600) {
        return {
          isValid: false,
          error: '目标时长必须在30-3600秒之间',
        }
      }
      validOptions.targetDuration = duration
    }

    return { isValid: true, validOptions }
  }
}