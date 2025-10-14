import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

export interface WhisperTranscription {
  text: string
  segments: Array<{
    id: number
    start: number
    end: number
    text: string
    confidence: number
  }>
  language: string
  duration: number
}

export class WhisperService {
  /**
   * 使用whisper-node进行语音识别
   */
  static async transcribeAudio(audioPath: string): Promise<WhisperTranscription> {
    try {
      // 检查音频文件是否存在
      if (!existsSync(audioPath)) {
        throw new Error(`音频文件不存在: ${audioPath}`)
      }

      // 构建whisper-node命令
      // 注意：这里假设whisper-node已正确安装并且模型文件已下载
      // 模型文件通常需要下载到 ~/.cache/whisper/ 目录
      const command = `npx whisper-node "${audioPath}" --model tiny --language zh --output_format json`
      
      console.log('执行Whisper命令:', command)
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr) {
        console.warn('Whisper stderr:', stderr)
      }

      // 解析whisper-node的输出
      // whisper-node的输出格式可能因版本而异，这里需要根据实际情况调整
      try {
        const result = JSON.parse(stdout)
        return this.parseWhisperOutput(result)
      } catch (parseError) {
        console.error('解析Whisper输出失败:', parseError)
        console.log('原始输出:', stdout)
        
        // 如果JSON解析失败，尝试从文本输出中提取信息
        return this.parseTextOutput(stdout, audioPath)
      }

    } catch (error) {
      console.error('Whisper语音识别错误:', error)
      
      // 如果whisper-node不可用，返回模拟数据用于开发
      return this.getMockTranscription(audioPath)
    }
  }

  /**
   * 解析JSON格式的Whisper输出
   */
  private static parseWhisperOutput(output: any): WhisperTranscription {
    return {
      text: output.text || '',
      segments: (output.segments || []).map((seg: any, index: number) => ({
        id: index,
        start: seg.start || 0,
        end: seg.end || 0,
        text: seg.text || '',
        confidence: seg.confidence || 0.5
      })),
      language: output.language || 'zh',
      duration: output.duration || 0
    }
  }

  /**
   * 解析文本格式的Whisper输出（备用方案）
   */
  private static parseTextOutput(output: string, audioPath: string): WhisperTranscription {
    // 这里实现文本输出的解析逻辑
    // 由于whisper-node的输出格式可能变化，这里提供一个基本实现
    
    const lines = output.split('\n').filter(line => line.trim())
    const segments: Array<{id: number, start: number, end: number, text: string, confidence: number}> = []
    
    let fullText = ''
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('-->')) {
        // 时间戳行，如: [00:00.000 --> 00:05.000]
        const timeMatch = line.match(/\[(\d+:\d+\.\d+) --> (\d+:\d+\.\d+)\]/)
        if (timeMatch && lines[i + 1]) {
          const start = this.parseTimeToSeconds(timeMatch[1])
          const end = this.parseTimeToSeconds(timeMatch[2])
          const text = lines[i + 1].trim()
          
          segments.push({
            id: segments.length,
            start,
            end,
            text,
            confidence: 0.7
          })
          
          fullText += text + ' '
          i++ // 跳过文本行
        }
      }
    }
    
    return {
      text: fullText.trim(),
      segments,
      language: 'zh',
      duration: segments.length > 0 ? segments[segments.length - 1].end : 0
    }
  }

  /**
   * 将时间字符串转换为秒数
   */
  private static parseTimeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0])
      const seconds = parseFloat(parts[1])
      return minutes * 60 + seconds
    }
    return 0
  }

  /**
   * 获取模拟的转录数据（用于开发和测试）
   */
  private static getMockTranscription(audioPath: string): WhisperTranscription {
    // 返回模拟数据，实际开发中应该使用真实的whisper-node
    return {
      text: '这是一个示例语音识别结果。这段文字是模拟数据，用于开发和测试目的。在实际应用中，这里应该是从音频文件中识别出的真实文本内容。',
      segments: [
        {
          id: 1,
          start: 0,
          end: 5.2,
          text: '这是一个示例语音识别结果。',
          confidence: 0.85
        },
        {
          id: 2,
          start: 5.2,
          end: 10.5,
          text: '这段文字是模拟数据，用于开发和测试目的。',
          confidence: 0.78
        },
        {
          id: 3,
          start: 10.5,
          end: 15.8,
          text: '在实际应用中，这里应该是从音频文件中识别出的真实文本内容。',
          confidence: 0.82
        }
      ],
      language: 'zh',
      duration: 15.8
    }
  }

  /**
   * 分析转录文本，提取关键信息
   */
  static analyzeTranscription(transcription: WhisperTranscription): {
    totalSegments: number
    importantSegments: number
    redundantSegments: number
    summary: string
  } {
    const totalSegments = transcription.segments.length
    
    // 简单的分析逻辑：根据置信度和文本长度判断重要性
    const importantSegments = transcription.segments.filter(seg => 
      seg.confidence > 0.7 && seg.text.length > 5
    ).length
    
    const redundantSegments = transcription.segments.filter(seg => 
      seg.confidence < 0.5 || seg.text.length <= 3
    ).length
    
    // 生成摘要
    const summary = transcription.segments
      .filter(seg => seg.confidence > 0.6)
      .slice(0, 3)
      .map(seg => seg.text)
      .join(' ')
      .substring(0, 200) + '...'
    
    return {
      totalSegments,
      importantSegments,
      redundantSegments,
      summary
    }
  }
}