import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { ErrorHandler, ErrorFactory, InputValidator } from '@/lib/server/errorHandler'

export async function POST(request: NextRequest) {
  const requestId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      const error = ErrorFactory.validationError('没有找到文件')
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 验证文件
    const fileValidation = InputValidator.validateFile(file)
    if (!fileValidation.isValid) {
      const error = ErrorFactory.validationError(fileValidation.error!)
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const originalName = file.name
    const extension = path.extname(originalName)
    const filename = `${timestamp}${extension}`

    // 验证文件名安全性
    const filenameValidation = InputValidator.validateFilename(filename)
    if (!filenameValidation.isValid) {
      const error = ErrorFactory.validationError(filenameValidation.error!)
      return ErrorHandler.createResponse(ErrorHandler.handle(error, requestId), requestId)
    }

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(uploadDir, filename)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const responseData = {
      filename,
      originalName,
      size: file.size,
      type: file.type,
    }

    return ErrorHandler.createSuccessResponse(responseData, requestId)
  } catch (error) {
    const apiError = ErrorHandler.handle(error, requestId)
    return ErrorHandler.createResponse(apiError, requestId)
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
