# 智剪蜂完整AI功能使用说明

## 🤖 功能概述

智剪蜂完整AI版本集成了以下真实AI功能：

- **语音识别**: 使用OpenAI Whisper进行高精度中文语音识别
- **语义分析**: 基于Transformers和规则引擎的智能内容分析
- **智能剪辑**: 结合AI分析结果的自动视频剪辑

## 📦 安装部署

### 1. 完整安装
```bash
# 安装所有AI依赖（首次使用）
./install_ai_full.sh
```

### 2. 功能测试
```bash
# 测试AI功能是否正常
./test_ai_full.py
```

### 3. 启动服务
```bash
# 启动完整AI版本
./start_ai_full.sh
```

### 4. 停止服务
```bash
# 停止所有服务
./stop_ai_full.sh
```

## 🎯 AI功能详解

### 语音识别 (OpenAI Whisper)
- **模型**: Whisper base模型（约39MB）
- **语言**: 专门优化中文识别
- **精度**: 词级时间戳，高精度转录
- **性能**: CPU模式下处理1分钟视频约需30-60秒

### 语义分析
- **冗余检测**: 识别"呃"、"嗯"等语气词和重复内容
- **重要性评分**: 基于关键词和内容长度的智能评分
- **内容分类**: 自动分类数据、案例、结论、要点等内容类型

### 智能剪辑
- **自动选择**: 根据重要性得分自动选择核心片段
- **时长控制**: 支持自定义目标时长（默认5分钟）
- **无缝拼接**: 使用FFmpeg进行高质量视频拼接

## 🔧 配置说明

### 环境变量配置 (backend/.env)
```bash
# AI模型配置
WHISPER_MODEL=base          # Whisper模型大小 (tiny/base/small/medium/large)
USE_GPU=false              # 是否使用GPU加速
AI_MODE=full               # AI模式 (full/mock)

# 处理配置
MAX_WORKERS=2              # 最大并发处理数
CHUNK_SIZE=30              # 音频分块大小（秒）
OVERLAP_SIZE=5             # 分块重叠大小（秒）

# 缓存目录
HUGGINGFACE_CACHE_DIR=~/.cache/huggingface
WHISPER_CACHE_DIR=~/.cache/whisper
```

### Whisper模型选择
| 模型 | 大小 | 内存需求 | 处理速度 | 精度 |
|------|------|----------|----------|------|
| tiny | 39MB | ~1GB | 最快 | 较低 |
| base | 74MB | ~1GB | 快 | 良好 |
| small | 244MB | ~2GB | 中等 | 很好 |
| medium | 769MB | ~5GB | 慢 | 优秀 |
| large | 1550MB | ~10GB | 最慢 | 最佳 |

## 📱 使用流程

### 1. 访问界面
- 前端地址: http://localhost:3000
- API文档: http://localhost:8000/docs

### 2. 上传视频
- 支持格式: MP4, AVI, MOV, MKV
- 建议时长: 10分钟-1小时
- 文件大小: 建议不超过500MB

### 3. 设置参数
- **目标时长**: 剪辑后的视频长度
- **质量模式**: 快速/标准/高质量
- **语言设置**: 中文/英文/自动检测

### 4. 处理过程
1. **上传完成** → 文件验证
2. **语音识别** → 提取文字内容（1-3分钟）
3. **语义分析** → 识别重要片段（30秒-1分钟）
4. **智能剪辑** → 生成最终视频（1-2分钟）

### 5. 下载结果
- 处理完成后自动提供下载链接
- 包含处理报告和统计信息

## 🚀 性能优化

### 硬件建议
- **CPU**: 4核心以上，推荐8核心
- **内存**: 8GB以上，推荐16GB
- **存储**: SSD硬盘，至少20GB可用空间
- **GPU**: 可选，支持CUDA的NVIDIA显卡可显著提升速度

### GPU加速设置
```bash
# 检查CUDA可用性
python -c "import torch; print(torch.cuda.is_available())"

# 启用GPU加速（修改.env文件）
USE_GPU=true
```

### 批量处理
- 支持队列处理多个视频
- 自动负载均衡
- 进度实时监控

## 🔍 故障排除

### 常见问题

#### 1. AI模型加载失败
```bash
# 检查网络连接和镜像配置
export HF_ENDPOINT=https://hf-mirror.com

# 手动下载模型
python -c "import whisper; whisper.load_model('base')"
```

#### 2. 内存不足
```bash
# 使用更小的模型
WHISPER_MODEL=tiny

# 减少并发数
MAX_WORKERS=1
```

#### 3. FFmpeg错误
```bash
# macOS安装FFmpeg
brew install ffmpeg

# Ubuntu安装FFmpeg
sudo apt update && sudo apt install ffmpeg
```

#### 4. 处理速度慢
- 使用更小的Whisper模型
- 启用GPU加速（如果可用）
- 减少视频分辨率
- 分段处理长视频

### 日志查看
```bash
# 查看后端日志
tail -f logs/backend.log

# 查看前端日志
tail -f logs/frontend.log

# 查看AI处理日志
grep "AI" logs/backend.log
```

## 📊 API接口

### 主要端点
- `POST /upload` - 上传视频文件
- `POST /process` - 开始AI处理
- `GET /status/{file_id}` - 查询处理状态
- `GET /download/{file_id}` - 下载处理结果
- `GET /health` - 健康检查

### 使用示例
```python
import requests

# 上传视频
files = {'file': open('video.mp4', 'rb')}
response = requests.post('http://localhost:8000/upload', files=files)
file_id = response.json()['file_id']

# 开始处理
data = {'file_id': file_id, 'target_duration': 300}
requests.post('http://localhost:8000/process', json=data)

# 查询状态
status = requests.get(f'http://localhost:8000/status/{file_id}')
print(status.json())
```

## 🎉 高级功能

### 自定义剪辑规则
- 支持自定义关键词权重
- 可配置内容类型优先级
- 支持时间段手动标记

### 批量处理
- 支持文件夹批量上传
- 自动队列管理
- 并行处理优化

### 输出格式
- 多种分辨率选择
- 不同压缩质量
- 字幕文件导出

## 📞 技术支持

如遇到问题，请：
1. 运行 `./test_ai_full.py` 进行诊断
2. 查看日志文件定位问题
3. 检查系统资源使用情况
4. 确认网络连接和镜像配置

---

**智剪蜂完整AI版本 - 让视频剪辑更智能！** 🎬✨