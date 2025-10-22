import { exec } from 'child_process'
import { promisify } from 'util'
import { join, basename } from 'path'
import { existsSync, unlinkSync } from 'fs'
import { ServerAudioProcessor } from './audioProcessor'
import { WhisperService, WhisperTranscription } from './whisperService'
import { SemanticAnalyzer } from '../semanticAnalyzer'
import { ErrorFactory } from './errorHandler'
import { logger, logPerformance } from './logger'
import { PerformanceMonitor } from './performanceMonitor'

const execAsync = promisify(exec)

export interface VideoProcessingResult {
  success: boolean
  originalDuration: number
  compressedDuration: number
  compressionRatio: string
  outputFilename: string
  transcription: string
  summary: string
}

export class ServerVideoProcessor {
  static async processVideo(filePath: string, requestId?: string): Promise<VideoProcessingResult> {
    const startTime = Date.now()
    const operationId = requestId || `video_processing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.info('Starting video processing', { filePath }, operationId)

    try {
      // 检查输入文件是否存在
      if (!existsSync(filePath)) {
        throw ErrorFactory.fileNotFound(filePath)
      }

      logger.debug('Input file exists, starting processing steps', {}, operationId)

      // 步骤1: 提取音频
      logger.info('Step 1: Extracting audio', {}, operationId)
      const audioPath = await ServerAudioProcessor.extractAudio(filePath)
      logger.debug('Audio extracted successfully', { audioPath }, operationId)

      // 步骤2: 语音转文字
      logger.info('Step 2: Transcribing audio', {}, operationId)
      const transcription = await WhisperService.transcribeAudio(audioPath)
      logger.debug('Transcription completed', { 
        segmentCount: transcription.segments?.length || 0,
        language: transcription.language 
      }, operationId)

      // 步骤3: 语义分析
      logger.info('Step 3: Analyzing transcription', {}, operationId)
      const analysisResult = WhisperService.analyzeTranscription(transcription)
      logger.debug('Analysis completed', {
        importantSegments: analysisResult.importantSegments || 0,
        redundantSegments: analysisResult.redundantSegments || 0
      }, operationId)

      // 步骤4: 视频压缩
      logger.info('Step 4: Compressing video', {}, operationId)
      const outputFilename = `compressed_${Date.now()}_${basename(filePath)}`
      const outputPath = join(process.cwd(), 'uploads', outputFilename)

      await this.compressVideo(filePath, outputPath, analysisResult, undefined, operationId)
      logger.info('Video compression completed', { outputPath }, operationId)

      // 清理临时文件
      this.cleanupTempFiles([audioPath], operationId)

      const result: VideoProcessingResult = {
        success: true,
        outputFilename,
        originalDuration: transcription.duration || 0,
        compressedDuration: transcription.duration || 0,
        transcription: transcription.text,
        summary: analysisResult.summary,
        compressionRatio: '1.0',
      }

      const duration = Date.now() - startTime
      
      // 记录性能指标
      PerformanceMonitor.recordMetrics(operationId, 'video_processing', duration, {
        filePath,
        success: true,
        originalDuration: result.originalDuration,
        compressedDuration: result.compressedDuration,
        segmentCount: transcription.segments?.length || 0
      })
      
      logger.performance('Video processing completed', duration, undefined, result, operationId)
      return result

    } catch (error) {
      const duration = Date.now() - startTime
      
      // 记录失败的性能指标
      PerformanceMonitor.recordMetrics(operationId, 'video_processing', duration, {
        filePath,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
      
      logger.error('Video processing failed', error as Error, { filePath, duration }, operationId)
      
      if (error instanceof Error && error.message.includes('not found')) {
        throw ErrorFactory.fileNotFound(filePath)
      } else if (error instanceof Error && error.message.includes('processing')) {
        throw ErrorFactory.processingFailed('video_processing', error.message)
      } else {
        throw ErrorFactory.internalError('视频处理过程中发生未知错误', { 
          originalError: error instanceof Error ? error.message : String(error) 
        })
      }
    }
  }

  private static async compressVideo(
    inputPath: string,
    outputPath: string,
    analysisResult: any,
    targetDuration?: number,
    requestId?: string
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      logger.info('Starting video compression', { inputPath, outputPath }, requestId)
      
      // 基本的视频压缩命令
      const compressionCommand = `ffmpeg -i "${inputPath}" -c:v libx264 -crf 23 -c:a aac -b:a 128k "${outputPath}"`
      
      logger.debug('Executing compression command', { command: compressionCommand }, requestId)
      await execAsync(compressionCommand)
      
      const duration = Date.now() - startTime
      logger.performance('Video compression completed', duration, undefined, { inputPath, outputPath }, requestId)
      
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Video compression failed', error as Error, { inputPath, outputPath, duration }, requestId)
      throw ErrorFactory.processingFailed('video_compression', `压缩失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private static cleanupTempFiles(filePaths: string[], requestId?: string): void {
    logger.debug('Cleaning up temporary files', { filePaths }, requestId)
    
    filePaths.forEach(filePath => {
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath)
          logger.debug('Temporary file deleted', { filePath }, requestId)
        }
      } catch (error) {
        logger.warn('Failed to delete temporary file', { filePath, error: (error as Error).message }, requestId)
        // 清理失败不应该阻止程序执行
      }
    })
  }
}