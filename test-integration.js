const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

async function testIntegration() {
  console.log('🧪 开始集成测试...\n')

  // 测试1: 检查FFmpeg
  console.log('1. 测试FFmpeg安装...')
  try {
    const ffmpegResult = await execAsync('ffmpeg -version')
    console.log('✅ FFmpeg安装正常:', ffmpegResult.stdout.split('\n')[0])
  } catch (error) {
    console.log('❌ FFmpeg未安装或不可用')
    return false
  }

  // 测试2: 检查Node.js依赖
  console.log('\n2. 检查Node.js依赖...')
  try {
    const depsResult = await execAsync('npm list whisper-node nodejieba fluent-ffmpeg')
    console.log('✅ 所有依赖安装正常')
  } catch (error) {
    console.log('❌ 依赖检查失败:', error.message)
    return false
  }

  // 测试3: 检查上传目录
  console.log('\n3. 检查上传目录...')
  const fs = require('fs')
  const path = require('path')
  const uploadsDir = path.join(__dirname, 'uploads')

  if (fs.existsSync(uploadsDir)) {
    console.log('✅ 上传目录存在')
  } else {
    console.log('❌ 上传目录不存在')
    return false
  }

  // 测试4: 检查环境变量
  console.log('\n4. 检查环境变量...')
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('✅ 环境文件存在')
    console.log(
      '   环境配置:',
      envContent.split('\n').filter(line => line.trim())
    )
  } else {
    console.log('❌ 环境文件不存在')
    return false
  }

  // 测试5: 检查TypeScript编译
  console.log('\n5. 检查TypeScript编译...')
  try {
    const buildResult = await execAsync('npm run build')
    console.log('✅ TypeScript编译成功')
  } catch (error) {
    console.log('❌ TypeScript编译失败:', error.message)
    return false
  }

  console.log('\n🎉 所有集成测试通过！')
  console.log('\n📋 系统状态:')
  console.log('   - FFmpeg: 已安装')
  console.log('   - Whisper-node: 已安装')
  console.log('   - Nodejieba: 已安装')
  console.log('   - 上传目录: 已创建')
  console.log('   - 环境配置: 已设置')
  console.log('   - TypeScript: 编译通过')
  console.log('\n🚀 系统已准备好进行视频处理！')

  return true
}

// 运行测试
testIntegration().catch(console.error)
