# Project Context

## Purpose
SwiftClip（智剪蜂）是一款基于AI的智能视频剪辑工具，专为口播视频设计。它能自动识别视频中的语音内容，分析语义重要性，并智能剪辑出精华内容，大幅提升视频观看效率。

核心目标：
- 自动化视频剪辑流程，减少人工干预
- 智能识别和保留重要内容，删除冗余部分
- 提供高效的视频压缩和处理能力
- 为内容创作者提供便捷的视频优化工具

## Tech Stack

### 前端技术栈
- **Next.js 14** - React全栈框架，支持SSR和API Routes
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript超集
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide React** - 现代图标库
- **Axios** - HTTP客户端

### 后端技术栈
- **Node.js** - JavaScript运行时
- **Next.js API Routes** - 服务端API端点
- **Multer** - 文件上传中间件
- **FFmpeg + fluent-ffmpeg** - 视频处理和压缩

### AI引擎
- **whisper-node** - OpenAI Whisper语音识别
- **nodejieba** - 中文分词库
- **natural** - 自然语言处理库
- **自定义语义分析引擎** - 基于规则的内容重要性评估

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS + Autoprefixer** - CSS后处理
- **严格TypeScript配置** - 类型安全保障

## Project Conventions

### Code Style
- **语言**: 使用TypeScript进行严格类型检查
- **格式化**: 遵循ESLint和Next.js推荐配置
- **命名约定**: 
  - 文件名使用kebab-case（如`video-processor.ts`）
  - 组件使用PascalCase（如`VideoPreview.tsx`）
  - 变量和函数使用camelCase
  - 常量使用UPPER_SNAKE_CASE
- **注释**: 为复杂逻辑和AI处理模块添加详细注释
- **国际化**: 支持中文界面和中文语音处理

### Architecture Patterns
- **文件结构**: 遵循Next.js 14 App Router约定
  - `app/` - 页面和API路由
  - `components/` - 可复用React组件
  - `lib/` - 工具库和服务
  - `lib/server/` - 服务端专用模块
- **API设计**: RESTful风格，使用Next.js API Routes
- **状态管理**: 使用React Hooks进行本地状态管理
- **错误处理**: 统一的错误处理和用户反馈机制
- **模块化**: 按功能模块组织代码（上传、处理、预览）

### Testing Strategy
- **测试文件**: 使用`test-*.js`命名约定
- **测试覆盖**: 
  - API端点功能测试
  - 语音识别模块测试
  - 语义分析逻辑测试
  - 视频处理流程测试
  - 集成测试
- **测试命令**: `npm test`运行所有测试
- **手动测试**: 提供独立的测试脚本用于各模块验证

### Git Workflow
- **分支策略**: 基于功能的分支开发
- **提交信息规范**: 
  - `feat`: 新功能
  - `fix`: bug修复
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `refactor`: 代码重构
  - `test`: 测试相关
  - `chore`: 构建过程或辅助工具变动
- **代码审查**: 通过Pull Request进行代码审查
- **版本管理**: 使用语义化版本控制

## Domain Context

### 视频处理领域知识
- **支持格式**: 主要处理MP4格式视频文件
- **文件大小限制**: 最大2GB，适合大多数口播视频
- **处理流程**: 上传 → 语音识别 → 语义分析 → 智能剪辑 → 压缩输出
- **目标时长**: 默认压缩到5分钟，可自定义调整

### AI处理特点
- **语音识别**: 专门优化中文语音识别准确性
- **语义分析**: 基于规则引擎识别重要内容和冗余部分
- **内容评估**: 使用自定义评分系统确定片段重要性
- **逻辑连贯**: 确保剪辑后内容逻辑完整

### 用户体验设计
- **实时反馈**: 处理过程中提供实时进度和状态更新
- **预览功能**: 支持原始视频和处理结果的对比预览
- **一键操作**: 简化用户操作流程，减少学习成本

## Important Constraints

### 技术约束
- **FFmpeg依赖**: 必须在系统中安装FFmpeg并配置到PATH
- **内存要求**: 建议8GB以上内存用于大文件处理
- **存储空间**: 至少10GB可用空间用于临时文件
- **Node.js版本**: 要求18.x或更高版本

### 性能约束
- **处理时间**: 视频处理时间通常为原视频时长的2-4倍
- **并发限制**: 单实例处理，避免资源竞争
- **文件大小**: 2GB文件大小限制，平衡处理能力和用户体验

### 业务约束
- **隐私保护**: 本地处理，不上传到外部服务
- **版权合规**: 仅用于合法内容的处理和优化
- **语言支持**: 主要针对中文语音内容优化

## External Dependencies

### 核心依赖
- **FFmpeg**: 视频处理和压缩的核心引擎
- **OpenAI Whisper**: 通过whisper-node集成的语音识别服务
- **系统PATH**: FFmpeg必须正确配置在系统环境变量中

### 可选依赖
- **Apple Silicon优化**: 针对M系列芯片进行性能优化
- **GPU加速**: 如果可用，利用硬件加速提升处理速度

### 开发依赖
- **Node.js生态**: 依赖npm包管理和Node.js运行时
- **现代浏览器**: 前端需要支持ES6+和现代Web API的浏览器
