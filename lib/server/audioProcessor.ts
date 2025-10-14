import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { existsSync, unlinkSync } from 'fs'

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
      console.error('Audio extraction error:', error)
      throw new Error(`音频提取失败: ${error}`)
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
      console.error('Duration detection error:', error)
      throw new Error(`获取视频时长失败: ${error}`)
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
        console.warn('清理文件失败:', filePath, error)
      }
    }
  }
}