import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync, createReadStream, statSync } from 'fs'

const UPLOADS_DIR = join(process.cwd(), 'uploads')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json(
        { error: '文件名参数缺失' },
        { status: 400 }
      )
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: '无效的文件名' },
        { status: 400 }
      )
    }

    const filePath = join(UPLOADS_DIR, filename)
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    // 获取文件信息
    const stats = statSync(filePath)
    const fileSize = stats.size
    
    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', fileSize.toString())
    headers.set('Content-Disposition', `inline; filename="${filename}"`)
    headers.set('Cache-Control', 'public, max-age=3600') // 缓存1小时
    headers.set('Accept-Ranges', 'bytes')

    // 处理范围请求（视频流式传输）
    const range = request.headers.get('range')
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      
      if (start >= fileSize || end >= fileSize) {
        return NextResponse.json(
          { error: '请求的范围超出文件大小' },
          { status: 416 }
        )
      }

      const fileStream = createReadStream(filePath, { start, end })
      
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      headers.set('Content-Length', chunksize.toString())

      return new Response(fileStream as any, {
        status: 206,
        statusText: 'Partial Content',
        headers,
      })
    }

    // 完整文件响应
    const fileStream = createReadStream(filePath)
    
    return new Response(fileStream as any, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('视频文件服务错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 配置路由
// 禁用body解析，因为我们处理的是文件流
export const config = {
  api: {
    bodyParser: false,
  },
}