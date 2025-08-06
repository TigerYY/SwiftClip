# 智剪蜂 (VocalCut) 🎬✨# 智剪蜂 - 智能视频剪辑系统

![智剪蜂](frontend/public/logo192.png)

## 项目简介

智剪蜂是一款基于AI的智能视频剪辑工具，专为口播视频设计。它能自动识别视频中的语音内容，分析语义重要性，并智能剪辑出精华内容，大幅提升视频观看效率。

### 核心功能

- **语音识别**：使用OpenAI Whisper模型将视频中的语音转换为带时间戳的文本
- **语义分析**：智能识别重要内容和冗余内容
- **智能剪辑**：根据内容重要性自动生成剪辑方案
- **视频处理**：使用FFmpeg进行高效视频剪辑和压缩

### 技术特点

- **M4芯片优化**：针对Apple Silicon M4芯片进行了专门优化
- **GPU加速**：支持MPS/CUDA加速，提升AI推理速度
- **低资源占用**：优化的算法设计，适合个人电脑运行
- **高压缩比**：智能剪辑后的视频通常比原视频小50%以上

## 系统要求

### 推荐配置
- **处理器**：Apple M系列芯片 或 NVIDIA GPU
- **内存**：8GB以上
- **存储**：SSD存储，至少10GB可用空间
- **操作系统**：macOS 12+/Windows 10+/Ubuntu 20.04+

### 最低配置
- **处理器**：4核心CPU
- **内存**：4GB
- **存储**：至少5GB可用空间

## 快速开始

### 安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/smart-video-cutter.git
cd smart-video-cutter
```

2. 安装依赖
```bash
# 完整安装（包含AI功能）
./install_ai_full.sh

# 或最小安装（仅基础功能）
./install_minimal.sh
```

### 启动服务

```bash
# M4芯片优化版本
./start_ai_m4.sh

# 或标准版本
./start_ai_full.sh

# 或最小版本（无AI功能）
./start_app.sh
```

### 使用方法

1. 打开浏览器访问 http://localhost:3000
2. 上传视频文件
3. 设置目标时长
4. 点击"开始处理"
5. 处理完成后下载剪辑结果

## 项目结构

```
.
├── ai_engine/          # AI核心引擎
├── backend/            # 后端服务
├── frontend/           # 前端界面
├── logs/               # 日志文件
├── scripts/            # 辅助脚本
├── *.sh                # 启动和管理脚本
└── README.md           # 项目说明
```

## 技术架构

- **前端**：React + TypeScript
- **后端**：FastAPI + Python
- **AI引擎**：PyTorch + Whisper + Transformers
- **视频处理**：FFmpeg

## 性能评估

| 视频时长 | 视频大小 | 处理时间(M4) | 处理时间(RTX 4060) |
|---------|---------|------------|-----------------|
| 5分钟    | 500MB   | 10-15分钟   | 7-10分钟         |
| 15分钟   | 1.5GB   | 30-45分钟   | 22-30分钟        |
| 30分钟   | 3GB     | 1-1.5小时   | 45-60分钟        |

详细性能评估请参考 [智能剪辑原理.md](智能剪辑原理.md)

## 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 贡献指南

欢迎提交问题和贡献代码！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 联系方式

- 项目维护者：[Your Name](mailto:your.email@example.com)
- 项目主页：[GitHub](https://github.com/yourusername/smart-video-cutter)

## 致谢

- [OpenAI Whisper](https://github.com/openai/whisper) - 语音识别模型
- [FFmpeg](https://ffmpeg.org/) - 视频处理库
- [FastAPI](https://fastapi.tiangolo.com/) - 后端框架
- [React](https://reactjs.org/) - 前端框架

**智能视频剪辑工具 - 让长视频秒变精华短片**

基于AI的自动视频剪辑系统，能够智能分析视频内容，自动识别重要片段，生成高质量的精简视频。

---

## 🌟 核心功能

### 🤖 完整AI功能版本
- **🎤 智能语音识别**: OpenAI Whisper高精度中文语音转文字
- **🧠 语义分析**: 基于Transformers的智能内容理解
- **✂️ 智能剪辑**: AI驱动的自动视频片段选择和拼接
- **📊 处理报告**: 详细的分析结果和统计信息

### 🚀 MVP演示版本
- **模拟AI处理**: 快速体验完整工作流程
- **界面预览**: 完整的用户交互界面
- **功能演示**: 展示所有核心功能模块

---

## 🛠️ 技术架构

### 前端技术栈
- **React 18** + **TypeScript** - 现代化前端框架
- **Ant Design** - 企业级UI组件库
- **Axios** - HTTP客户端

### 后端技术栈
- **Python 3.8+** + **FastAPI** - 高性能异步Web框架
- **OpenAI Whisper** - 语音识别引擎
- **Transformers** - 自然语言处理
- **FFmpeg** - 视频处理引擎

### AI引擎
- **语音识别**: Whisper base/small/medium模型
- **语义分析**: 规则引擎 + 机器学习
- **视频处理**: FFmpeg + Python集成

---

## 🚀 快速开始

### 📋 环境要求
- **Python**: 3.8或更高版本
- **Node.js**: 16或更高版本  
- **FFmpeg**: 视频处理必需
- **内存**: 建议8GB以上
- **存储**: 至少20GB可用空间

### 🎯 选择版本

#### 完整AI功能版本（推荐生产使用）
```bash
# 1. 完整安装（包含所有AI依赖）
./install_ai_full.sh

# 2. 测试AI功能
./test_ai_full.py

# 3. 启动完整版本
./start_ai_full.sh

# 4. 检查运行状态
./check_ai_status.sh
```

#### MVP演示版本（快速体验）
```bash
# 1. 快速安装（轻量级依赖）
./install_env.sh

# 2. 启动演示版本
./start_app.sh
```

### 🌐 访问应用
- **前端界面**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

---

## 📁 项目结构

```
智能剪辑/
├── 📱 frontend/              # React前端应用
│   ├── src/
│   │   ├── App.tsx          # 主应用组件
│   │   ├── components/      # UI组件
│   │   └── services/        # API服务
│   └── package.json
│
├── 🔧 backend/              # FastAPI后端服务
│   ├── main.py             # 主应用入口
│   ├── processor.py        # 视频处理器
│   ├── uploads/            # 上传文件目录
│   ├── outputs/            # 输出文件目录
│   └── requirements.txt    # Python依赖
│
├── 🤖 ai_engine/           # AI处理核心
│   └── core.py            # VocalCut引擎
│
├── 📜 脚本文件/
│   ├── install_ai_full.sh  # 完整AI安装
│   ├── start_ai_full.sh    # 启动AI版本
│   ├── test_ai_full.py     # AI功能测试
│   └── check_ai_status.sh  # 状态检查
│
└── 📚 文档/
    ├── README.md           # 项目说明
    ├── AI功能使用说明.md    # AI功能详细说明
    └── MVP_使用说明.md     # MVP版本说明
```

---

## 🎯 使用流程

### 1️⃣ 上传视频
- 支持格式: MP4, AVI, MOV, MKV
- 建议时长: 10分钟 - 1小时
- 文件大小: 建议不超过500MB

### 2️⃣ 设置参数
- **目标时长**: 剪辑后的视频长度（默认5分钟）
- **处理模式**: 快速/标准/高质量
- **语言设置**: 中文/英文/自动检测

### 3️⃣ AI处理过程
1. **语音识别** (1-3分钟) - 提取完整文字内容
2. **语义分析** (30秒-1分钟) - 识别重要片段
3. **智能剪辑** (1-2分钟) - 生成最终视频

### 4️⃣ 下载结果
- 处理完成的精简视频
- 详细的处理报告
- 转录文本和时间戳

---

## 🔧 配置说明

### AI模型配置 (backend/.env)
```bash
# Whisper模型选择
WHISPER_MODEL=base          # tiny/base/small/medium/large
USE_GPU=false              # GPU加速开关
AI_MODE=full               # full/mock

# 处理参数
MAX_WORKERS=2              # 并发处理数
CHUNK_SIZE=30              # 音频分块大小
OVERLAP_SIZE=5             # 分块重叠大小
```

### 模型性能对比
| 模型 | 大小 | 内存需求 | 处理速度 | 识别精度 |
|------|------|----------|----------|----------|
| tiny | 39MB | ~1GB | 最快 | 较低 |
| base | 74MB | ~1GB | 快 | 良好 ⭐ |
| small | 244MB | ~2GB | 中等 | 很好 |
| medium | 769MB | ~5GB | 慢 | 优秀 |
| large | 1550MB | ~10GB | 最慢 | 最佳 |

---

## 🚀 性能优化

### 硬件建议
- **CPU**: 4核心以上，推荐8核心
- **内存**: 8GB以上，推荐16GB  
- **GPU**: 可选CUDA支持，显著提升处理速度
- **存储**: SSD硬盘，提升I/O性能

### GPU加速
```bash
# 检查CUDA可用性
python -c "import torch; print(torch.cuda.is_available())"

# 启用GPU加速
echo "USE_GPU=true" >> backend/.env
```

---

## 🔍 故障排除

### 常见问题解决

#### AI模型加载失败
```bash
# 配置国内镜像
export HF_ENDPOINT=https://hf-mirror.com

# 手动下载模型
python -c "import whisper; whisper.load_model('base')"
```

#### 内存不足
```bash
# 使用更小的模型
WHISPER_MODEL=tiny

# 减少并发处理
MAX_WORKERS=1
```

#### FFmpeg相关错误
```bash
# macOS安装
brew install ffmpeg

# Ubuntu安装  
sudo apt update && sudo apt install ffmpeg
```

### 日志查看
```bash
# 实时查看后端日志
tail -f logs/backend.log

# 查看AI处理日志
grep "AI" logs/backend.log

# 系统状态检查
./check_ai_status.sh
```

---

## 📊 API接口

### 核心端点
```http
POST   /upload              # 上传视频文件
POST   /process             # 开始AI处理  
GET    /status/{file_id}    # 查询处理状态
GET    /download/{file_id}  # 下载处理结果
GET    /health              # 健康检查
```

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
```

---

## 🎉 高级功能

### 批量处理
- 支持多文件队列处理
- 自动负载均衡
- 进度实时监控

### 自定义剪辑
- 关键词权重配置
- 内容类型优先级
- 手动时间段标记

### 多格式输出
- 不同分辨率选择
- 压缩质量调节
- 字幕文件导出

---

## 🤝 开发贡献

### 开发环境设置
```bash
# 克隆项目
git clone <repository-url>
cd 智能剪辑

# 开发模式安装
./install_ai_full.sh

# 运行测试
./test_ai_full.py
```

### 代码规范
- Python: PEP 8
- TypeScript: ESLint + Prettier
- 提交信息: Conventional Commits

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 技术支持

- 📧 **问题反馈**: 提交Issue
- 📖 **详细文档**: [AI功能使用说明.md](AI功能使用说明.md)
- 🔧 **故障诊断**: 运行 `./test_ai_full.py`

---

**智剪蜂 - 让视频剪辑更智能！** 🎬✨

*基于AI的下一代视频处理工具，让每个人都能轻松制作专业级短视频。*