const fs = require('fs')
const path = require('path')

async function testAPI() {
  console.log('🧪 测试API端点...\n')

  // 检查测试视频文件
  const testVideoPath = path.join(__dirname, 'uploads', 'test-video.mp4')
  if (!fs.existsSync(testVideoPath)) {
    console.log('❌ 测试视频文件不存在')
    return false
  }

  console.log('✅ 测试视频文件存在')

  // 获取文件信息
  const stats = fs.statSync(testVideoPath)
  console.log(`📊 文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

  // 测试上传API
  console.log('\n📤 测试上传API...')
  try {
    const FormData = require('form-data')
    const fetch = require('node-fetch')

    const formData = new FormData()
    formData.append('file', fs.createReadStream(testVideoPath))

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 上传API测试成功')
      console.log(`   文件名: ${result.filename}`)
      console.log(`   文件大小: ${result.size}`)

      // 测试处理API
      console.log('\n⚙️ 测试处理API...')
      const processResponse = await fetch('http://localhost:3000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: result.filename,
          targetDuration: 5, // 目标5秒
        }),
      })

      if (processResponse.ok) {
        const processResult = await processResponse.json()
        console.log('✅ 处理API测试成功')
        console.log(`   原始时长: ${processResult.originalDuration}秒`)
        console.log(`   压缩后时长: ${processResult.compressedDuration}秒`)
        console.log(`   压缩比例: ${processResult.compressionRatio}`)
        console.log(`   输出文件: ${processResult.outputFilename}`)

        // 检查输出文件
        const outputPath = path.join(__dirname, 'uploads', processResult.outputFilename)
        if (fs.existsSync(outputPath)) {
          const outputStats = fs.statSync(outputPath)
          console.log(`✅ 输出文件验证成功: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`)
          return true
        } else {
          console.log('❌ 输出文件不存在')
          return false
        }
      } else {
        console.log('❌ 处理API失败:', await processResponse.text())
        return false
      }
    } else {
      console.log('❌ 上传API失败:', await response.text())
      return false
    }
  } catch (error) {
    console.log('❌ API测试异常:', error.message)
    return false
  }
}

// 运行测试
testAPI()
  .then(success => {
    if (success) {
      console.log('\n🎉 API端点测试通过！')
      console.log('\n🚀 系统已准备好处理真实视频文件！')
    } else {
      console.log('\n❌ API测试失败')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('测试异常:', error)
    process.exit(1)
  })
