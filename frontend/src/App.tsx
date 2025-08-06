import React, { useState } from 'react';
import { Upload, Button, Card, Progress, message, Typography, Space, InputNumber } from 'antd';
import { InboxOutlined, PlayCircleOutlined, DownloadOutlined, ScissorOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface ProcessingStatus {
  file_id: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  output_url?: string;
  processing_stats?: {
    processing_time_formatted: string;
    original_size_formatted: string;
    processed_size_formatted: string;
    compression_ratio: number;
  };
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    file_id: '',
    status: 'idle',
    progress: 0,
    message: '等待上传视频文件'
  });
  const [targetDuration, setTargetDuration] = useState<number>(5); // 5分钟

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'video/*',
    beforeUpload: (file: File) => {
      // 验证文件大小 (2GB)
      const isLt2G = file.size / 1024 / 1024 / 1024 < 2;
      if (!isLt2G) {
        message.error('文件大小不能超过2GB!');
        return false;
      }
      
      // 验证文件类型
      const isVideo = file.type.startsWith('video/');
      if (!isVideo) {
        message.error('请上传视频文件!');
        return false;
      }
      
      return true;
    },
    customRequest: async (options: any) => {
      const { file, onSuccess, onError, onProgress } = options;
      
      setProcessingStatus({
        file_id: '',
        status: 'uploading',
        progress: 0,
        message: '正在上传视频文件...'
      });

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress({ percent });
            setProcessingStatus(prev => ({
              ...prev,
              progress: percent
            }));
          },
        });

        if (response.data.success) {
          setUploadedFile({
            name: file.name,
            file_id: response.data.file_id
          });
          setProcessingStatus({
            file_id: response.data.file_id,
            status: 'idle',
            progress: 100,
            message: '文件上传成功，可以开始处理'
          });
          onSuccess(response.data);
          message.success('文件上传成功!');
        }
      } catch (error: any) {
        onError(error);
        setProcessingStatus(prev => ({
          ...prev,
          status: 'failed',
          message: '文件上传失败: ' + (error.response?.data?.detail || error.message)
        }));
        message.error('文件上传失败!');
      }
    },
  };

  // 开始处理视频
  const handleProcessVideo = async () => {
    if (!uploadedFile) {
      message.error('请先上传视频文件');
      return;
    }

    setProcessingStatus(prev => ({
      ...prev,
      status: 'processing',
      progress: 0,
      message: '正在进行AI智能剪辑...'
    }));

    try {
      const response = await axios.post('/api/process', {
        file_id: uploadedFile.file_id,
        target_duration: targetDuration * 60 // 转换为秒
      });

      if (response.data.success) {
        // 模拟处理进度
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setProcessingStatus(prev => ({
            ...prev,
            progress: progress,
            message: progress < 100 ? 
              `AI正在分析视频内容... ${progress}%` : 
              '处理完成！'
          }));

          if (progress >= 100) {
            clearInterval(interval);
            
            // 获取处理统计信息
            const stats = response.data.result?.processing_stats;
            let completedMessage = '处理完成！';
            
            if (stats) {
              completedMessage = `处理完成！用时 ${stats.processing_time_formatted}，文件大小从 ${stats.original_size_formatted} 压缩到 ${stats.processed_size_formatted}`;
              if (stats.compression_ratio > 0) {
                completedMessage += `，压缩了 ${stats.compression_ratio.toFixed(1)}%`;
              }
            }
            
            setProcessingStatus(prev => ({
              ...prev,
              status: 'completed',
              message: completedMessage,
              output_url: `/api/download/${uploadedFile.file_id}`,
              processing_stats: stats
            }));
          }
        }, 300);

        message.success('视频处理已开始');
      }
    } catch (error: any) {
      setProcessingStatus(prev => ({
        ...prev,
        status: 'failed',
        message: '处理失败: ' + (error.response?.data?.detail || error.message)
      }));
      message.error('视频处理失败!');
    }
  };

  // 下载处理后的视频
  const handleDownload = async () => {
    if (!processingStatus.output_url) {
      message.error('下载链接不可用');
      return;
    }

    try {
      // 创建一个临时的a标签来触发下载
      const response = await fetch(processingStatus.output_url);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      // 设置下载文件名
      const fileName = uploadedFile?.name ? 
        `${uploadedFile.name.split('.')[0]}_剪辑版.mp4` : 
        '智剪蜂_剪辑结果.mp4';
      
      link.download = fileName;
      document.body.appendChild(link);
      
      // 使用setTimeout确保DOM元素已添加
      setTimeout(() => {
        link.click();
        // 清理
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
      
      message.success('文件下载已开始');
    } catch (error: any) {
      console.error('下载失败:', error);
      message.error('下载失败: ' + error.message);
      
      // 如果fetch下载失败，尝试直接打开链接
      const link = document.createElement('a');
      link.href = processingStatus.output_url;
      link.download = uploadedFile?.name ? 
        `${uploadedFile.name.split('.')[0]}_剪辑版.mp4` : 
        '智剪蜂_剪辑结果.mp4';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <Title level={1}>
            <ScissorOutlined style={{ color: '#1890ff', marginRight: 16 }} />
            智剪蜂
          </Title>
          <Paragraph style={{ fontSize: 16, color: '#666' }}>
            AI驱动的口播视频智能剪辑工具，让长视频秒变精华短片
          </Paragraph>
        </div>

        <div className="main-content">
          {/* 上传区域 */}
          <Card title="📁 上传视频" style={{ marginBottom: 24 }}>
            <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽视频文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 MP4、MOV 等格式，文件大小不超过 2GB
              </p>
            </Dragger>

            {uploadedFile && (
              <div style={{ padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <Text strong>已上传文件：</Text>
                <Text>{uploadedFile.name}</Text>
              </div>
            )}
          </Card>

          {/* 设置区域 */}
          <Card title="⚙️ 剪辑设置" style={{ marginBottom: 24 }}>
            <Space align="center">
              <Text>目标时长：</Text>
              <InputNumber
                min={1}
                max={30}
                value={targetDuration}
                onChange={(value) => setTargetDuration(value || 5)}
                addonAfter="分钟"
              />
              <Text type="secondary">（将自动压缩到指定时长）</Text>
            </Space>
          </Card>

          {/* 处理区域 */}
          <Card title="🤖 AI处理" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>处理状态：</Text>
                <Text style={{ marginLeft: 8 }}>{processingStatus.message}</Text>
              </div>

              {processingStatus.status !== 'idle' && (
                <Progress 
                  percent={processingStatus.progress} 
                  status={
                    processingStatus.status === 'failed' ? 'exception' :
                    processingStatus.status === 'completed' ? 'success' : 'active'
                  }
                />
              )}

              {/* 处理完成后显示详细统计信息 */}
              {processingStatus.status === 'completed' && processingStatus.processing_stats && (
                <div style={{ 
                  padding: 16, 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f', 
                  borderRadius: 6,
                  marginTop: 16 
                }}>
                  <Title level={5} style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
                    📊 处理统计信息
                  </Title>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                      <Text strong>⏱️ 处理时间：</Text>
                      <br />
                      <Text style={{ fontSize: 16, color: '#1890ff' }}>
                        {processingStatus.processing_stats.processing_time_formatted}
                      </Text>
                    </div>
                    <div>
                      <Text strong>📁 原始大小：</Text>
                      <br />
                      <Text style={{ fontSize: 16 }}>
                        {processingStatus.processing_stats.original_size_formatted}
                      </Text>
                    </div>
                    <div>
                      <Text strong>📦 压缩后：</Text>
                      <br />
                      <Text style={{ fontSize: 16, color: '#52c41a' }}>
                        {processingStatus.processing_stats.processed_size_formatted}
                      </Text>
                    </div>
                    <div>
                      <Text strong>📉 压缩比例：</Text>
                      <br />
                      <Text style={{ fontSize: 16, color: '#fa8c16' }}>
                        {processingStatus.processing_stats.compression_ratio > 0 ? 
                          `${processingStatus.processing_stats.compression_ratio.toFixed(1)}%` : 
                          '无压缩'
                        }
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleProcessVideo}
                  disabled={!uploadedFile || processingStatus.status === 'processing'}
                  loading={processingStatus.status === 'processing'}
                  size="large"
                >
                  开始智能剪辑
                </Button>

                {processingStatus.status === 'completed' && (
                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    size="large"
                  >
                    下载剪辑结果
                  </Button>
                )}
              </Space>
            </Space>
          </Card>

          {/* 功能说明 */}
          <Card title="✨ 功能特色" size="small">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <Text strong>🎯 智能识别</Text>
                <br />
                <Text type="secondary">自动识别核心内容和冗余片段</Text>
              </div>
              <div>
                <Text strong>✂️ 精准剪辑</Text>
                <br />
                <Text type="secondary">保留关键信息，删除无效内容</Text>
              </div>
              <div>
                <Text strong>⚡ 快速处理</Text>
                <br />
                <Text type="secondary">AI加速，3分钟处理10分钟视频</Text>
              </div>
              <div>
                <Text strong>🎬 专业输出</Text>
                <br />
                <Text type="secondary">高质量视频输出，支持多种格式</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;