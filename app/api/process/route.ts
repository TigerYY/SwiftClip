import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { ServerVideoProcessor } from '@/lib/server/videoProcessor'

export async function POST(request: NextRequest) {
  try {
    const { filename, targetDuration = 300 } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Check if file exists
    const filepath = join(process.cwd(), 'uploads', filename)
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 实际处理视频
    const result = await ServerVideoProcessor.processVideo(filepath, targetDuration)

    // 返回最终结果
    return NextResponse.json(result)

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}