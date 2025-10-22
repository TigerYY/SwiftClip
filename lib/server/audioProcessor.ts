import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { existsSync, unlinkSync } from 'fs'
import { ErrorFactory } from './errorHandler'

const execAsync = promisify(exec)

export class ServerAudioProcessor {
  /**
   * 从视频中提取音频
   */
  static async extractAudio(videoPath: string): Promise<string> {
    const audioPath = videoPath.replace(/\.\w+$/, '.wav')

    try {
      const command = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`
      await execAsync(command)

      if (existsSync(audioPath)) {
        return audioPath
      } else {
        throw new Error('音频提取失败')
      }
    } catch (error) {
      // TODO: 实现结构化日志记录系统 - 记录音频提取错误
      throw ErrorFactory.processingFailed(
        'audio_extraction',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * 获取视频时长
   */
  static async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
      const { stdout } = await execAsync(command)

      const duration = parseFloat(stdout.trim())
      if (isNaN(duration)) {
        throw new Error('无法解析视频时长')
      }

      return duration
    } catch (error) {
      // TODO: 实现结构化日志记录系统 - 记录时长检测错误
      throw ErrorFactory.processingFailed(
        'duration_detection',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * 清理临时文件
   */
  static cleanupFile(filePath: string): void {
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath)
      } catch (error) {
        // TODO: 实现结构化日志记录系统
        // 文件清理失败不应该阻止程序继续执行
      }
    }
  }
}
