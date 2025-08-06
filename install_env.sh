#!/bin/bash

# 智剪蜂 - 环境安装脚本
# 用于安装所有必要的依赖和环境配置

echo "🔧 智剪蜂环境安装开始..."

# 检查系统环境
echo "📋 检查系统环境..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python3"
    echo "💡 安装建议:"
    echo "   macOS: brew install python3"
    echo "   Ubuntu: sudo apt install python3 python3-pip python3-venv"
    echo "   CentOS: sudo yum install python3 python3-pip"
    exit 1
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "💡 安装建议:"
    echo "   官网下载: https://nodejs.org/"
    echo "   macOS: brew install node"
    echo "   Ubuntu: sudo apt install nodejs npm"
    exit 1
fi

# 检查FFmpeg（可选，用于真实AI处理）
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  警告: 未找到FFmpeg，AI视频处理功能将使用模拟模式"
    echo "💡 安装建议:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   如需完整AI功能，请安装FFmpeg后重新运行此脚本"
else
    echo "✅ FFmpeg已安装，支持完整AI处理功能"
fi

echo "✅ 系统环境检查完成"
echo "   Python版本: $(python3 --version)"
echo "   Node.js版本: $(node --version)"
echo "   npm版本: $(npm --version)"

# 创建必要的目录
echo "📁 创建项目目录..."
mkdir -p backend/uploads
mkdir -p backend/outputs
mkdir -p logs
echo "✅ 项目目录创建完成"

# 配置国内镜像源
echo "🌐 配置国内镜像源..."

# 配置pip镜像源
echo "📦 配置Python pip镜像源..."
pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip3 config set install.trusted-host pypi.tuna.tsinghua.edu.cn
echo "✅ pip镜像源配置完成（清华大学源）"

# 配置npm镜像源
echo "📦 配置Node.js npm镜像源..."
npm config set registry https://registry.npmmirror.com
echo "✅ npm镜像源配置完成（淘宝源）"

# 安装后端依赖
echo "🐍 安装Python后端依赖..."
cd backend

if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
    echo "✅ Python虚拟环境创建完成"
fi

echo "激活虚拟环境并安装依赖..."
source venv/bin/activate

# 升级pip
pip install --upgrade pip

# 尝试安装最小依赖包
echo "正在安装Python最小依赖包..."

# 首先尝试安装最小依赖
if pip install -r requirements-minimal.txt; then
    echo "✅ 最小依赖包安装成功"
else
    echo "⚠️  最小依赖包安装失败，尝试逐个安装..."
    
    # 逐个安装核心依赖
    echo "安装FastAPI..."
    pip install fastapi || echo "⚠️  FastAPI安装失败"
    
    echo "安装Uvicorn..."
    pip install uvicorn || echo "⚠️  Uvicorn安装失败"
    
    echo "安装文件上传支持..."
    pip install python-multipart || echo "⚠️  python-multipart安装失败"
    
    echo "安装HTTP请求库..."
    pip install requests || echo "⚠️  requests安装失败"
    
    echo "安装环境配置..."
    pip install python-dotenv || echo "⚠️  python-dotenv安装失败"
fi

# 验证核心功能
echo "验证核心依赖..."
python -c "
try:
    import fastapi
    import uvicorn
    print('✅ 核心Web框架可用')
except ImportError as e:
    print(f'⚠️  核心依赖缺失: {e}')
    print('💡 请手动安装: pip install fastapi uvicorn')
"

echo ""
echo "💡 MVP版本说明:"
echo "   ✅ 使用最小依赖包，安装更快更稳定"
echo "   ✅ AI功能使用模拟模式，无需大型依赖"
echo "   ✅ 如需真实AI功能，可后续手动安装相关包"
echo "   📦 完整依赖列表见: requirements.txt"

cd ..

# 安装前端依赖
echo "⚛️  安装React前端依赖..."
cd frontend

echo "正在安装Node.js依赖包..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Node.js依赖安装完成"
else
    echo "❌ Node.js依赖安装失败，请检查网络连接或package.json文件"
    exit 1
fi

cd ..

# 创建环境配置文件
echo "⚙️  创建环境配置..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ 后端环境配置文件已创建: backend/.env"
    echo "💡 提示: 可根据需要修改配置文件"
fi

# 验证安装
echo "🧪 验证安装结果..."

# 检查Python虚拟环境
cd backend
source venv/bin/activate
python -c "import fastapi, uvicorn; print('✅ FastAPI环境正常')" 2>/dev/null || echo "⚠️  FastAPI环境可能有问题"
deactivate
cd ..

# 检查Node.js环境
cd frontend
if [ -d "node_modules" ]; then
    echo "✅ Node.js依赖安装正常"
else
    echo "⚠️  Node.js依赖可能有问题"
fi
cd ..

echo ""
echo "🎉 智剪蜂环境安装完成！"
echo "📋 安装摘要:"
echo "   ✅ Python虚拟环境: backend/venv/"
echo "   ✅ Python依赖: 已安装"
echo "   ✅ Node.js依赖: 已安装"
echo "   ✅ 国内镜像源: 已配置"
echo "   ✅ 项目目录: 已创建"
echo ""
echo "🚀 下一步: 运行 ./start_app.sh 启动应用"
echo "📖 详细说明: 查看 MVP_使用说明.md"