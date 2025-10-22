const { ServerVideoProcessor } = require('./lib/server/videoProcessor')
const { existsSync } = require('fs')
const path = require('path')

async function testVideoProcessing() {
  console.log('🎬 测试视频处理功能...\n')

  // 创建一个测试视频文件（使用FFmpeg生成一个简单的测试视频）
  const testVideoPath = path.join(__dirname, 'uploads', 'test-video.mp4')

  if (!existsSync(testVideoPath)) {
    console.log('📹 创建测试视频...')
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)

    try {
      // 使用FFmpeg创建一个10秒的测试视频
      const command = `ffmpeg -f lavfi -i testsrc=duration=10:size=640x360:rate=30 -f lavfi -i sine=frequency=440:duration=10 -c:v libx264 -c:a aac "${testVideoPath}"`
      await execAsync(command)
      console.log('✅ 测试视频创建成功')
    } catch (error) {
      console.log('❌ 测试视频创建失败:', error.message)
      return false
    }
  }

  console.log('\n⚙️ 开始视频处理测试...')

  try {
    // 测试视频处理
    const result = await ServerVideoProcessor.processVideo(testVideoPath, 5) // 目标时长5秒

    console.log('✅ 视频处理成功！')
    console.log('\n📊 处理结果:')
    console.log(`   原始时长: ${result.originalDuration.toFixed(1)} 秒`)
    console.log(`   压缩后时长: ${result.compressedDuration.toFixed(1)} 秒`)
    console.log(`   压缩比例: ${result.compressionRatio}`)
    console.log(`   输出文件: ${result.outputFilename}`)
    console.log(`   处理状态: ${result.success ? '成功' : '失败'}`)

    // 检查输出文件是否存在
    const outputPath = path.join(__dirname, 'uploads', result.outputFilename)
    if (existsSync(outputPath)) {
      console.log('✅ 输出文件验证成功')
    } else {
      console.log('❌ 输出文件不存在')
      return false
    }

    console.log('\n🎉 视频处理功能测试通过！')
    return true
  } catch (error) {
    console.log('❌ 视频处理失败:', error.message)
    return false
  }
}

// 运行测试
testVideoProcessing()
  .then(success => {
    if (success) {
      console.log('\n🚀 系统已准备好处理真实视频文件！')
      console.log('\n📋 下一步:')
      console.log('   1. 通过网页界面上传视频文件')
      console.log('   2. 系统将自动进行语音识别和语义分析')
      console.log('   3. 生成智能压缩版本')
      console.log('   4. 提供下载链接')
    } else {
      console.log('\n❌ 测试失败，请检查系统配置')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('测试异常:', error)
    process.exit(1)
  })
