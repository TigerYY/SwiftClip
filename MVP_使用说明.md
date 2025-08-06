# 智剪蜂 MVP 使用说明

## 🚀 快速启动

### 1. 环境准备
确保您的系统已安装：
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 2. 安装环境（首次运行）
```bash
# 给脚本添加执行权限（仅首次需要）
chmod +x install_env.sh start_app.sh stop_app.sh

# 安装运行环境和依赖
./install_env.sh
```

安装脚本将自动：
- 检查系统环境（Python3、Node.js、FFmpeg）
- 配置国内镜像源（pip、npm）
- 创建Python虚拟环境并安装依赖
- 安装前端依赖包
- 创建必要的目录和配置文件

### 3. 启动应用
```bash
# 启动应用服务
./start_app.sh
```

启动后将自动：
- 启动后端API服务（端口8000）
- 启动前端开发服务器（端口3000）
- 显示服务状态和访问地址

### 4. 访问应用
- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

### 5. 停止服务
```bash
./stop_app.sh
```

## 📱 使用流程

### 1. 上传视频
- 点击上传区域或拖拽视频文件
- 支持格式：MP4、MOV等
- 文件大小限制：2GB

### 2. 设置参数
- 选择目标时长（默认5分钟）
- 系统将自动压缩到指定时长

### 3. 开始处理
- 点击"开始智能剪辑"按钮
- AI将自动进行：
  - 语音识别
  - 语义分析
  - 智能剪辑

### 4. 下载结果
- 处理完成后点击"下载剪辑结果"
- 获得压缩后的精华视频

## 🔧 功能特色

### AI智能处理
- **语音识别**: 精准转写口语内容，支持中英文
- **语义分析**: 识别核心段落和冗余内容
- **智能剪辑**: 保留关键信息，删除无效片段

### 用户体验
- **可视化界面**: 直观的上传和处理流程
- **实时进度**: 显示处理状态和进度
- **快速处理**: 平均3分钟处理10分钟视频

## 🧪 测试功能

### 自动化测试
```bash
# 运行功能测试（需要准备测试视频文件）
python3 test_mvp.py
```

测试将验证：
- 服务健康状态
- 文件上传功能
- 视频处理功能
- 状态查询功能
- 文件下载功能

### 手动测试
1. 准备一个10-30分钟的口播视频
2. 通过前端界面上传并处理
3. 对比原视频和处理后的视频效果

## 📂 项目结构

```
智剪蜂/
├── backend/              # Python FastAPI 后端
│   ├── main.py          # 主应用入口
│   ├── processor.py     # 视频处理器
│   ├── requirements.txt # Python依赖
│   ├── uploads/         # 上传文件目录
│   └── outputs/         # 输出文件目录
├── frontend/            # React 前端
│   ├── src/            # 源代码
│   ├── public/         # 静态资源
│   └── package.json    # Node.js依赖
├── ai_engine/          # AI处理核心
│   └── core.py         # 核心算法
├── logs/               # 日志文件
├── start_mvp.sh        # 启动脚本
├── stop_mvp.sh         # 停止脚本
└── test_mvp.py         # 测试脚本
```

## 🐛 常见问题

### 1. 启动失败
- 检查Python和Node.js版本
- 确保端口3000和8000未被占用
- 查看日志文件：`logs/backend.log` 和 `logs/frontend.log`

### 2. 处理失败
- 确保视频文件格式正确
- 检查文件大小是否超过限制
- 查看后端日志了解具体错误

### 3. 依赖安装问题
```bash
# 手动安装后端依赖（使用国内镜像）
cd backend
python3 -m venv venv
source venv/bin/activate
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn
pip install -r requirements.txt

# 手动安装前端依赖（使用国内镜像）
cd frontend
npm config set registry https://registry.npmmirror.com
npm install
```

### 4. 镜像源配置
为了提高依赖安装速度，建议配置国内镜像源：

**Python pip镜像源**
```bash
# 清华大学镜像源（推荐）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn

# 或使用阿里云镜像源
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip config set install.trusted-host mirrors.aliyun.com
```

**Node.js npm镜像源**
```bash
# 淘宝镜像源（推荐）
npm config set registry https://registry.npmmirror.com

# 或使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install  # 使用cnpm代替npm install
```

**注意**: 启动脚本 `start_mvp.sh` 已自动配置国内镜像源，无需手动设置。

### 4. AI模型加载问题
MVP版本使用模拟AI引擎，如需使用真实AI功能：
- 安装FFmpeg: `brew install ffmpeg` (macOS) 或 `apt install ffmpeg` (Ubuntu)
- 确保有足够的磁盘空间用于模型下载

## 📈 下一步计划

### 第二阶段功能
- 手动微调界面
- 一键添加字幕
- 自定义剪辑规则
- 预览对比功能

### 第三阶段功能
- 用户系统
- 多版本生成
- 质量分析报告
- 商业化功能

## 💡 技术支持

如遇到问题，请：
1. 查看日志文件获取详细错误信息
2. 确认环境配置是否正确
3. 运行测试脚本验证功能
4. 检查网络连接和防火墙设置

---

**智剪蜂团队**  
让长视频秒变精华短片 🎬✨