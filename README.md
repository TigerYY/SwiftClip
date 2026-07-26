# SwiftClip - 智能视频剪辑系统 🎬✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)

SwiftClip（智剪蜂）是一款基于AI的智能视频剪辑工具，适用于口播、教学、讲座、访谈、会议回放等多种视频场景。它能自动识别视频中的语音内容，分析语义重要性，并智能剪辑出精华内容，实现将 10 分钟以上视频浓缩至约 5 分钟的短视频，同时保持信息完整与逻辑连贯。

## 🌟 核心功能

- **🎤 智能语音识别**: 使用OpenAI Whisper模型精准识别中文语音内容
- **🧠 语义分析**: 智能识别重要内容和冗余内容，保持逻辑连贯性
- **✂️ 自动剪辑**: 根据内容重要性自动生成剪辑方案，时长精准控制
- **📊 处理报告**: 详细的分析结果和统计信息展示
- **👀 视频预览**: 支��原始视频和处理结果预览
- **⚡ 高效处理**: 使用FFmpeg进行高效视频剪辑和压缩

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.x 或更高版本
- **FFmpeg**: 必须安装并配置到系统PATH中
- **操作系统**: macOS, Windows, Linux
- **内存**: 建议8GB以上
- **存储**: 至少10GB可用空间

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/TigerYY/SwiftClip.git
   cd SwiftClip
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **安装FFmpeg** (如果尚未安装)
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **Windows**: 下载并安装 [FFmpeg for Windows](https://ffmpeg.org/download.html)

4. **配置环境变量** (可选)
   ```bash
   # 确保FFmpeg在PATH中
   export PATH="/path/to/ffmpeg:$PATH"
   ```

### 启动应用

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

访问 http://localhost:3000 开始使用

## 📖 使用方法

### 1. 上传视频
- 拖拽视频文件到上传区域，或点击选择文件
- 支持MP4格式，最大2GB
- 实时显示上传进度

### 2. 开始处理
- 点击"开始处理"按钮
- 系统将自动进行以下步骤：
  - 语音识别（OpenAI Whisper）
  - 语义分析和内容重要性评估
  - 智能片段选择和剪辑方案生成
  - 视频压缩和处理

### 3. 查看结果
- 实时查看处理进度和当前步骤
- 查看语义分析结果（总分段、重要分段、冗余分段）
- 预览原始视频和处理结果
- 下载压缩后的视频文件

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks

### 后端
- **运行时**: Node.js
- **Web框架**: Next.js API Routes
- **文件处理**: Multer
- **视频处理**: FFmpeg + fluent-ffmpeg

### AI引擎
- **语音识别**: whisper-node (OpenAI Whisper)
- **语义分析**: 自定义规则引擎 + nodejieba中文分词
- **内容评估**: 基于规则的重要性评分系统

### 项目结构
```
SwiftClip/
├── app/                 # Next.js应用
│   ├── api/            # API端点
│   │   ├── upload/     # 文件上传
│   │   ├── process/    # 视频处理
│   │   └── video/      # 视频流服务
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 应用布局
│   └── page.tsx        # 主页面
├── components/         # React组件
│   └── VideoPreview.tsx # 视频预览组件
├── lib/               # 工具库
│   ├── server/        # 服务端工具
│   │   ├── audioProcessor.ts    # 音频处理
│   │   ├── videoProcessor.ts    # 视频处理
│   │   └── whisperService.ts   # Whisper服务
│   └── semanticAnalyzer.ts     # 语义分析
├── uploads/           # 文件存储目录
├── test-*.js          # 测试脚本
└── 配置文件
```

## 🔧 API接口

### 文件上传
```http
POST /api/upload
Content-Type: multipart/form-data

// 请求体: FormData包含文件
// 响应: { filename: string, size: number }
```

### 视频处理
```http
POST /api/process
Content-Type: application/json

// 请求体: { filename: string, targetDuration?: number }
// 响应: 处理结果对象
```

### 视频流
```http
GET /api/video?filename={filename}

// 响应: 视频流数据
```

## 📊 性能指标

### 处理时间参考
| 视频时长 | 视频大小 | 处理时间(M芯片) | 处理时间(标准CPU) |
|---------|---------|----------------|------------------|
| 5分钟   | 500MB   | 10-15分钟      | 15-20分钟        |
| 15分钟  | 1.5GB   | 30-45分钟      | 45-60分钟        |
| 30分钟  | 3GB     | 1-1.5小时      | 1.5-2小时        |

### 压缩效果
- **压缩比**: 通常比原视频小50%以上
- **质量保持**: 保持核心内容，删除冗余部分
- **逻辑连贯**: 智能片段选择确保内容连贯性

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
node test-api.js
node test-whisper.js
node test-integration.js
```

### 测试覆盖
- ✅ API端点功能测试
- ✅ 语音识别模块测试
- ✅ 语义分析逻辑测试
- ✅ 视频处理流程测试
- ✅ 集成测试

## 🚀 部署

### 开发部署
```bash
npm run dev
```

### 生产部署
```bash
npm run build
npm start
```

### 环境变量配置
创建 `.env.local` 文件：
```env
# 服务器配置
PORT=3000

# 文件上传配置
MAX_FILE_SIZE=2147483648  # 2GB
UPLOAD_DIR=./uploads

# AI模型配置
WHISPER_MODEL=tiny
```

## 🤝 贡献指南

欢迎提交问题和贡献代码！请参阅：[贡献指南](CONTRIBUTING.md)

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [OpenAI Whisper](https://github.com/openai/whisper) - 语音识别模型
- [FFmpeg](https://ffmpeg.org/) - 视频处理库
- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

## 📞 联系方式

- **项目维护者**: TigerYY
- **项目主页**: https://github.com/TigerYY/SwiftClip
- **问题反馈**: [Issues](https://github.com/TigerYY/SwiftClip/issues)
- **功能建议**: [Discussions](https://github.com/TigerYY/SwiftClip/discussions)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！

---

*最后更新: 2024年12月*  
*文档版本: v1.0*
