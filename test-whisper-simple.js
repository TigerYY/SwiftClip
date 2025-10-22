#!/usr/bin/env node

// 简单测试Whisper服务的基本功能
const { WhisperService } = require('./.next/server/chunks/276.js') // 可能需要调整路径

async function testWhisper() {
  console.log('🧪 测试Whisper服务基本功能...\n')

  try {
    // 测试模拟转录
    console.log('1. 测试模拟转录功能...')
    const mockTranscription = WhisperService.getMockTranscription('test.wav')

    console.log('✅ 模拟转录成功')
    console.log(`   文本: "${mockTranscription.text.substring(0, 50)}..."`)
    console.log(`   分段数: ${mockTranscription.segments.length}`)
    console.log(`   总时长: ${mockTranscription.duration}秒`)

    // 测试语义分析
    console.log('\n2. 测试语义分析功能...')
    const analysis = WhisperService.analyzeTranscription(mockTranscription)

    console.log('✅ 语义分析成功')
    console.log(`   总分段: ${analysis.totalSegments}`)
    console.log(`   重要分段: ${analysis.importantSegments}`)
    console.log(`   冗余分段: ${analysis.redundantSegments}`)
    console.log(`   摘要: ${analysis.summary}`)

    console.log('\n🎉 Whisper服务基本功能测试完成！')
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testWhisper()
