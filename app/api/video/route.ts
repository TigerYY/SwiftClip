import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import { ErrorHandler, ErrorFactory, InputValidator } from '@/lib/server/errorHandler'

export async function GET(request: NextRequest) {
  const requestId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const filename = request.nextUrl.searchParams.get('filename')

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

    const filePath = join(process.cwd(), 'uploads', filename)

    if (!existsSync(filePath)) {
      const error = ErrorFactory.fileNotFound(filename)
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    const fileStream = createReadStream(filePath)

    // 根据文件扩展名设置正确的MIME类型
    let contentType = 'video/mp4'
    if (filename.endsWith('.webm')) {
      contentType = 'video/webm'
    } else if (filename.endsWith('.mov')) {
      contentType = 'video/quicktime'
    }

    return new Response(fileStream as unknown as ReadableStream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    const apiError = ErrorHandler.handle(error, requestId)
    return ErrorHandler.createResponse(apiError, requestId)
  }
}