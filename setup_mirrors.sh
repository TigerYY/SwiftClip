#!/bin/bash

# 智剪蜂 - 国内镜像源配置脚本
# 用于提高依赖安装速度

echo "🔧 配置国内镜像源..."

# 配置pip镜像源
echo "📦 配置Python pip镜像源..."
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn
echo "✅ pip镜像源配置完成（清华大学源）"

# 配置npm镜像源
echo "📦 配置Node.js npm镜像源..."
npm config set registry https://registry.npmmirror.com
echo "✅ npm镜像源配置完成（淘宝源）"

# 显示当前配置
echo ""
echo "📋 当前镜像源配置："
echo "Python pip: $(pip config get global.index-url)"
echo "Node.js npm: $(npm config get registry)"

echo ""
echo "🎉 镜像源配置完成！现在可以快速安装依赖了。"
echo "💡 提示：如需恢复官方源，请运行："
echo "   pip config unset global.index-url"
echo "   npm config set registry https://registry.npmjs.org/"