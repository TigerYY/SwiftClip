#!/usr/bin/env node

const { WhisperService } = require('./lib/server/whisperService')
const { ServerAudioProcessor } = require('./lib/server/audioProcessor')
const { exec } = require('child_process')
const { promisify } = require('util')
const { join } = require('path')
const { existsSync, writeFileSync } = require('fs')

const execAsync = promisify(exec)

async function testWhisperIntegration() {
  console.log('🧪 测试Whisper语音识别集成...\n')

  try {
    // 1. 检查whisper-node是否安装
    console.log('1. 检查whisper-node安装...')
    try {
      await execAsync('npx whisper-node --version')
      console.log('✅ whisper-node已安装')
    } catch (error) {
      console.log('⚠️  whisper-node未安装或不可用，将使用模拟数据')
      console.log('   如果需要真实语音识别，请运行: npm install whisper-node')
    }

    // 2. 创建测试音频文件
    console.log('\n2. 创建测试音频文件...')
    const testAudioPath = join(process.cwd(), 'uploads', 'test-audio.wav')

    // 使用FFmpeg生成一个简单的测试音频
    const testCommand = `ffmpeg -f lavfi -i "sine=frequency=1000:duration=5" -ac 1 -ar 16000 "${testAudioPath}"`

    try {
      await execAsync(testCommand)
      if (existsSync(testAudioPath)) {
        console.log('✅ 测试音频文件创建成功')
      } else {
        throw new Error('测试音频文件创建失败')
      }
    } catch (error) {
      console.log('⚠️  无法创建测试音频，使用现有文件或模拟模式')

      // 检查是否有现有的测试文件
      const existingTestVideo = join(process.cwd(), 'uploads', 'test-video.mp4')
      if (existsSync(existingTestVideo)) {
        console.log('📹 使用现有测试视频文件提取音频...')
        const extractedAudio = await ServerAudioProcessor.extractAudio(existingTestVideo)
        console.log(`✅ 音频提取成功: ${extractedAudio}`)
      } else {
        console.log('📝 将完全使用模拟模式进行测试')
        // 直接进行模拟测试
        await testMockWhisper()
        return
      }
    }

    // 3. 测试语音识别
    console.log('\n3. 测试语音识别功能...')
    const transcription = await WhisperService.transcribeAudio(testAudioPath)

    console.log('✅ 语音识别完成')
    console.log(`   识别语言: ${transcription.language}`)
    console.log(`   总时长: ${transcription.duration}秒`)
    console.log(`   识别文本: "${transcription.text.substring(0, 100)}..."`)
    console.log(`   分段数量: ${transcription.segments.length}`)

    // 4. 测试语义分析
    console.log('\n4. 测试语义分析功能...')
    const analysis = WhisperService.analyzeTranscription(transcription)

    console.log('✅ 语义分析完成')
    console.log(`   总分段: ${analysis.totalSegments}`)
    console.log(`   重要分段: ${analysis.importantSegments}`)
    console.log(`   冗余分段: ${analysis.redundantSegments}`)
    console.log(`   内容摘要: ${analysis.summary}`)

    // 5. 清理测试文件
    console.log('\n5. 清理测试文件...')
    if (existsSync(testAudioPath)) {
      ServerAudioProcessor.cleanupFile(testAudioPath)
      console.log('✅ 测试文件清理完成')
    }

    console.log('\n🎉 Whisper语音识别集成测试完成！')
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error.stack)
  }
}

async function testMockWhisper() {
  console.log('\n🧪 测试模拟Whisper模式...')

  // 直接调用模拟模式
  const mockTranscription = WhisperService.getMockTranscription('mock-audio.wav')

  console.log('✅ 模拟语音识别完成')
  console.log(`   识别语言: ${mockTranscription.language}`)
  console.log(`   总时长: ${mockTranscription.duration}秒`)
  console.log(`   识别文本: "${mockTranscription.text}"`)
  console.log(`   分段数量: ${mockTranscription.segments.length}`)

  // 测试语义分析
  const analysis = WhisperService.analyzeTranscription(mockTranscription)

  console.log('✅ 语义分析完成')
  console.log(`   总分段: ${analysis.totalSegments}`)
  console.log(`   重要分段: ${analysis.importantSegments}`)
  console.log(`   冗余分段: ${analysis.redundantSegments}`)
  console.log(`   内容摘要: ${analysis.summary}`)

  console.log('\n🎉 模拟模式测试完成！')
  console.log('💡 提示: 要使用真实语音识别，请确保whisper-node正确安装')
}

// 运行测试
testWhisperIntegration()
