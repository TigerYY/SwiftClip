#!/bin/bash

# 智剪蜂 - 最小化安装脚本
# 专门解决pip依赖问题的简化版本

echo "🚀 智剪蜂最小化安装"
echo "=" * 30

# 检查基础环境
echo "📋 检查基础环境..."
python3 --version || { echo "❌ Python3未安装"; exit 1; }
pip3 --version || { echo "❌ pip3未安装"; exit 1; }

# 创建目录
echo "📁 创建必要目录..."
mkdir -p backend/{uploads,outputs} logs

# 进入后端目录
cd backend

# 创建或激活虚拟环境
echo "🐍 设置Python虚拟环境..."
if [ ! -d "venv" ]; then
    python3 -m venv venv || { echo "❌ 虚拟环境创建失败"; exit 1; }
fi

source venv/bin/activate || { echo "❌ 虚拟环境激活失败"; exit 1; }

# 升级pip
echo "⬆️  升级pip..."
python -m pip install --upgrade pip

# 配置镜像源
echo "🌐 配置镜像源..."
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn

# 清理缓存
echo "🧹 清理pip缓存..."
pip cache purge 2>/dev/null || echo "缓存清理跳过"

# 逐个安装核心依赖（最保守的方式）
echo "📦 安装核心依赖..."

# 定义最小依赖列表
declare -a packages=(
    "fastapi==0.104.1"
    "uvicorn==0.24.0" 
    "python-multipart==0.0.6"
    "requests==2.31.0"
    "python-dotenv==1.0.0"
)

# 逐个安装
for package in "${packages[@]}"; do
    echo "安装 $package..."
    if pip install --no-cache-dir "$package"; then
        echo "✅ $package 安装成功"
    else
        echo "❌ $package 安装失败，尝试不指定版本..."
        package_name=$(echo "$package" | cut -d'=' -f1)
        if pip install --no-cache-dir "$package_name"; then
            echo "✅ $package_name 安装成功（使用最新版本）"
        else
            echo "⚠️  $package_name 安装失败，将影响功能"
        fi
    fi
done

# 验证安装
echo "🧪 验证安装..."
python -c "
import sys
success = True

try:
    import fastapi
    print('✅ FastAPI 可用')
except ImportError:
    print('❌ FastAPI 不可用')
    success = False

try:
    import uvicorn
    print('✅ Uvicorn 可用')
except ImportError:
    print('❌ Uvicorn 不可用')
    success = False

try:
    import multipart
    print('✅ python-multipart 可用')
except ImportError:
    print('❌ python-multipart 不可用')
    success = False

try:
    import requests
    print('✅ requests 可用')
except ImportError:
    print('❌ requests 不可用')
    success = False

if success:
    print('🎉 核心依赖验证成功！')
    sys.exit(0)
else:
    print('⚠️  部分依赖缺失，但基本功能可能仍可使用')
    sys.exit(1)
"

install_result=$?

cd ..

# 安装前端依赖（简化版）
echo "⚛️  安装前端依赖..."
cd frontend

# 配置npm镜像
npm config set registry https://registry.npmmirror.com

# 安装依赖
if npm install --no-optional; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    echo "💡 尝试清理缓存后重试..."
    npm cache clean --force
    npm install --no-optional || echo "⚠️  前端依赖安装仍然失败"
fi

cd ..

# 总结
echo ""
echo "📋 安装总结:"
if [ $install_result -eq 0 ]; then
    echo "✅ 后端依赖安装成功"
else
    echo "⚠️  后端依赖部分安装失败"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "⚠️  前端依赖安装失败"
fi

echo ""
echo "🚀 下一步:"
echo "   1. 运行 ./start_app.sh 启动应用"
echo "   2. 如有问题，运行 ./diagnose_pip.py 诊断"
echo "   3. 访问 http://localhost:3000 使用应用"