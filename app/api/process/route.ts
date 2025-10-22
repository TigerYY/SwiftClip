import { NextRequest, NextResponse } from 'next/server'
import { ServerVideoProcessor } from '@/lib/server/videoProcessor'
import { ErrorHandler, ErrorFactory, InputValidator } from '@/lib/server/errorHandler'

export async function POST(request: NextRequest) {
  const requestId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const { filename, targetDuration } = await request.json()

    if (!filename) {
      const error = ErrorFactory.validationError('缺少文件名参数')
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 验证文件名安全性
    const filenameValidation = InputValidator.validateFilename(filename)
    if (!filenameValidation.isValid) {
      const error = ErrorFactory.validationError(filenameValidation.error!)
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 验证处理选项
    const optionsValidation = InputValidator.validateProcessingOptions({ targetDuration })
    if (!optionsValidation.isValid) {
      const error = ErrorFactory.validationError(optionsValidation.error!)
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 构建完整文件路径
    const filePath = require('path').join(process.cwd(), 'uploads', filename)
    const result = await ServerVideoProcessor.processVideo(
      filePath,
      optionsValidation.validOptions?.targetDuration
    )

    return ErrorHandler.createSuccessResponse(result, requestId)
  } catch (error) {
    const apiError = ErrorHandler.handle(error, requestId)
    return ErrorHandler.createResponse(apiError, requestId)
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
