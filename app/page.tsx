'use client'

import React, { useState, useRef } from 'react'
import { Upload, Play, Brain, Scissors, Download, FileVideo, Clock, Eye } from 'lucide-react'
import { VideoPreview } from '../components/VideoPreview'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setUploadProgress(0)
      setResult(null)
      setShowPreview(false)
      
      // 创建预览URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleProcessVideo = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)
    setCurrentStep('准备处理环境')

    try {
      // 步骤1: 上传文件
      setProgress(10)
      setCurrentStep('上传视频文件中...')
      
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('上传失败')
      }

      const uploadResult = await uploadResponse.json()
      setProgress(30)
      setCurrentStep('视频分析中...')

      // 步骤2: 处理视频
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadResult.filename,
          targetDuration: 300, // 5 minutes
        }),
      })

      if (!processResponse.ok) {
        throw new Error('处理失败')
      }

      // 模拟处理进度更新
      const steps = [
        { progress: 40, step: '语音识别中...' },
        { progress: 60, step: '语义分析中...' },
        { progress: 80, step: '生成剪辑方案...' },
        { progress: 90, step: '视频压缩处理中...' }
      ]

      for (const { progress: stepProgress, step } of steps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setProgress(stepProgress)
        setCurrentStep(step)
      }

      const processResult = await processResponse.json()
      setResult(processResult)
      setProgress(100)
      setCurrentStep('处理完成！')

    } catch (error) {
      console.error('Error:', error)
      setCurrentStep('处理失败，请重试')
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      setSelectedFile(files[0])
      setUploadProgress(0)
      setResult(null)
      setShowPreview(false)
      
      // 创建预览URL
      const url = URL.createObjectURL(files[0])
      setPreviewUrl(url)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  // 清理预览URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            口播压缩专家
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            智能压缩10分钟以上口播视频至5分钟，保留核心内容与逻辑连贯性
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-16">
        {/* Upload Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-semibold mb-2">上传口播视频</h2>
              <p className="text-gray-300">支持MP4、WebM等视频格式，最大500MB</p>
            </div>

            <div 
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-lg mb-2">
                {selectedFile ? selectedFile.name : '点击选择或拖拽视频文件到这里'}
              </p>
              <p className="text-sm text-gray-400">
                支持MP4, WebM, MOV格式，最大500MB
              </p>
            </div>

            {selectedFile && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>文件大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>类型: {selectedFile.type}</span>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={togglePreview}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? '隐藏预览' : '预览视频'}
                  </button>
                  
                  <button
                    onClick={handleProcessVideo}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isProcessing ? '处理中...' : '开始智能压缩'}
                  </button>
                </div>
                
                {/* 视频预览区域 */}
                {showPreview && previewUrl && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-purple-400" />
                      视频预览
                    </h4>
                    <VideoPreview
                      videoUrl={previewUrl}
                      title={selectedFile.name}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Processing Progress */}
        {isProcessing && (
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold mb-6 text-center">处理进度</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">当前步骤</span>
                  <span className="font-medium">{currentStep}</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">完成进度</span>
                  <span className="font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {result && result.success && (
          <section className="max-w-4xl mx-auto mb-16">
            <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-8 border border-green-500/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-green-400 mb-2">处理完成！</h3>
                <p className="text-gray-300">视频已成功压缩</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="font-medium">原始时长</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.floor(result.originalDuration / 60)}分{Math.round(result.originalDuration % 60)}秒
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Play className="w-5 h-5 text-green-400 mr-2" />
                    <span className="font-medium">压缩后时长</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {Math.floor(result.compressedDuration / 60)}分{Math.round(result.compressedDuration % 60)}秒
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Scissors className="w-5 h-5 text-cyan-400 mr-2" />
                    <span className="font-medium">压缩比例</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{result.compressionRatio}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <FileVideo className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="font-medium">输出文件</span>
                  </div>
                  <p className="text-sm font-mono text-gray-300 truncate">{result.outputFilename}</p>
                </div>
              </div>

              {/* 语义分析结果 */}
              {result.analysisResult && (
                <div className="bg-blue-500/10 rounded-xl p-6 mb-6 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    语义分析结果
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{result.analysisResult.totalSegments}</div>
                      <div className="text-sm text-gray-300">总分段</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{result.analysisResult.importantSegments}</div>
                      <div className="text-sm text-gray-300">重要内容</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{result.analysisResult.redundantSegments}</div>
                      <div className="text-sm text-gray-300">冗余内容</div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h5 className="font-medium text-blue-300 mb-2">内容摘要</h5>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {result.analysisResult.summary}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                <div className="flex space-x-4 justify-center">
                  <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
                    <Download className="w-5 h-5 mr-2 inline" />
                    下载视频
                  </button>
                  
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Eye className="w-5 h-5 mr-2 inline" />
                    {showPreview ? '隐藏预览' : '预览视频'}
                  </button>
                </div>
                
                {/* 压缩后视频预览 */}
                {showPreview && result.outputFilename && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-lg font-semibold mb-3 flex items-center justify-center">
                      <Eye className="w-5 h-5 mr-2 text-purple-400" />
                      压缩后视频预览
                    </h4>
                    <VideoPreview
                      videoUrl={`/api/video?filename=${result.outputFilename}`}
                      title="压缩后的视频"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              专为知识博主和内容创作者设计的智能视频处理工具
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI智能识别</h3>
              <p className="text-gray-600 text-sm">
                使用OpenAI Whisper模型精准识别语音内容，
                保留核心信息点
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">智能剪辑</h3>
              <p className="text-gray-600 text-sm">
                自动删除冗余内容，保持逻辑连贯性，
                时长精准控制
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">高质量输出</h3>
              <p className="text-gray-600 text-sm">
                保持原始视频质量，支持多种格式导出，
                移动端友好
              </p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 bg-white rounded-xl shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">工作原理</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              四步完成智能视频压缩，简单高效
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: '语音识别', desc: 'Whisper模型转文字' },
              { step: '2', title: '语义分析', desc: 'AI识别核心内容' },
              { step: '3', title: '剪辑方案', desc: '生成最优时间线' },
              { step: '4', title: '视频处理', desc: 'FFmpeg精准剪辑' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 口播XX - 智能视频压缩工具
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}