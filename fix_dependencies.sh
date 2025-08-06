#!/bin/bash

# 智剪蜂 - 依赖问题修复脚本
# 用于解决常见的依赖安装问题

echo "🔧 智剪蜂依赖问题修复工具"
echo "=" * 40

# 检查Python环境
echo "🐍 检查Python环境..."
python3 --version
pip3 --version

# 清理pip缓存
echo "🧹 清理pip缓存..."
pip3 cache purge

# 升级pip
echo "⬆️  升级pip..."
pip3 install --upgrade pip

# 尝试不同的镜像源
echo "🌐 尝试不同的镜像源..."

mirrors=(
    "https://pypi.tuna.tsinghua.edu.cn/simple"
    "https://mirrors.aliyun.com/pypi/simple/"
    "https://pypi.mirrors.ustc.edu.cn/simple/"
    "https://pypi.douban.com/simple/"
)

for mirror in "${mirrors[@]}"; do
    echo "尝试镜像源: $mirror"
    pip3 config set global.index-url "$mirror"
    
    # 测试安装一个小包
    if pip3 install --no-cache-dir requests; then
        echo "✅ 镜像源 $mirror 可用"
        break
    else
        echo "❌ 镜像源 $mirror 不可用"
    fi
done

# 进入后端目录
cd backend

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "创建新的虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
fi

# 逐个安装最基础的依赖
echo "📦 逐个安装基础依赖..."

basic_packages=(
    "fastapi"
    "uvicorn"
    "python-multipart"
    "requests"
    "python-dotenv"
)

for package in "${basic_packages[@]}"; do
    echo "安装 $package..."
    if pip install --no-cache-dir "$package"; then
        echo "✅ $package 安装成功"
    else
        echo "❌ $package 安装失败，尝试备用方案..."
        # 尝试不带版本号安装
        pip install --no-deps --no-cache-dir "$package" || echo "⚠️  $package 完全安装失败"
    fi
done

# 验证安装
echo "🧪 验证安装结果..."
python -c "
import sys
packages = ['fastapi', 'uvicorn', 'requests', 'multipart', 'dotenv']
missing = []

for pkg in packages:
    try:
        if pkg == 'multipart':
            __import__('multipart')
        elif pkg == 'dotenv':
            __import__('dotenv')
        else:
            __import__(pkg)
        print(f'✅ {pkg} 可用')
    except ImportError:
        print(f'❌ {pkg} 不可用')
        missing.append(pkg)

if not missing:
    print('🎉 所有核心依赖都已安装成功！')
else:
    print(f'⚠️  缺失依赖: {missing}')
    print('💡 建议手动安装缺失的包')
"

echo ""
echo "🎯 修复完成！"
echo "💡 如果仍有问题，请尝试："
echo "   1. 重新创建虚拟环境: rm -rf venv && python3 -m venv venv"
echo "   2. 使用系统Python: pip3 install --user fastapi uvicorn"
echo "   3. 检查系统权限和磁盘空间"
echo ""
echo "🚀 修复后请运行: ./start_app.sh"