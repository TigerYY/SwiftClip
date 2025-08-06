#!/bin/bash

# 智剪蜂 - 清理安装脚本
# 选择性清理环境，保留重要文件

echo "🧹 智剪蜂环境清理"
echo "=" * 25

echo "⚠️  此脚本将清理以下内容:"
echo "   - Python虚拟环境 (backend/venv)"
echo "   - 前端依赖 (frontend/node_modules)"
echo "   - 临时文件和缓存"
echo "   - 日志文件"
echo ""
echo "✅ 保留以下内容:"
echo "   - FFmpeg (系统级安装)"
echo "   - 源代码文件"
echo "   - 配置文件"
echo "   - 用户数据"
echo ""

read -p "确定要清理环境吗？(y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消清理"
    exit 0
fi

# 停止正在运行的服务
echo "🛑 停止运行中的服务..."
if [ -f "stop_ai_full.sh" ]; then
    ./stop_ai_full.sh >/dev/null 2>&1 || true
fi

# 清理Python虚拟环境
if [ -d "backend/venv" ]; then
    echo "🐍 清理Python虚拟环境..."
    rm -rf backend/venv
    echo "   ✅ 虚拟环境已删除"
else
    echo "   ✅ 虚拟环境不存在"
fi

# 清理前端依赖
if [ -d "frontend/node_modules" ]; then
    echo "⚛️  清理前端依赖..."
    rm -rf frontend/node_modules
    echo "   ✅ node_modules已删除"
else
    echo "   ✅ node_modules不存在"
fi

# 清理前端构建文件
if [ -d "frontend/build" ]; then
    echo "🏗️  清理前端构建文件..."
    rm -rf frontend/build
    echo "   ✅ build目录已删除"
fi

# 清理缓存文件
echo "🗑️  清理缓存文件..."
rm -rf backend/__pycache__ 2>/dev/null || true
rm -rf backend/**/__pycache__ 2>/dev/null || true
rm -rf .pytest_cache 2>/dev/null || true
rm -rf backend/.pytest_cache 2>/dev/null || true
echo "   ✅ Python缓存已清理"

# 清理日志文件
if [ -d "logs" ]; then
    echo "📋 清理日志文件..."
    rm -rf logs/*.log 2>/dev/null || true
    rm -rf logs/*.pid 2>/dev/null || true
    echo "   ✅ 日志文件已清理"
fi

# 清理临时文件
echo "🗂️  清理临时文件..."
rm -rf backend/uploads/* 2>/dev/null || true
rm -rf backend/outputs/* 2>/dev/null || true
rm -rf .DS_Store 2>/dev/null || true
rm -rf **/.DS_Store 2>/dev/null || true
echo "   ✅ 临时文件已清理"

# 清理pip缓存
echo "📦 清理pip缓存..."
pip cache purge >/dev/null 2>&1 || true
echo "   ✅ pip缓存已清理"

# 清理npm缓存
echo "📦 清理npm缓存..."
npm cache clean --force >/dev/null 2>&1 || true
echo "   ✅ npm缓存已清理"

# 清理系统缓存（可选）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 清理macOS缓存..."
    rm -rf ~/Library/Caches/pip 2>/dev/null || true
    rm -rf ~/.cache/huggingface 2>/dev/null || true
    rm -rf ~/.cache/whisper 2>/dev/null || true
    echo "   ✅ 系统缓存已清理"
fi

# 显示清理结果
echo ""
echo "📊 清理完成统计:"

# 计算释放的空间
if command -v du >/dev/null 2>&1; then
    current_size=$(du -sh . 2>/dev/null | cut -f1 || echo "未知")
    echo "   当前项目大小: $current_size"
fi

echo ""
echo "✅ 环境清理完成！"
echo ""
echo "🚀 下一步操作:"
echo "   1. 运行 ./install_ai_full.sh 重新安装完整环境"
echo "   2. 或运行 ./update_ai_deps.sh 进行增量安装"
echo "   3. 安装完成后使用 ./start_ai_m4.sh 启动服务"
echo ""
echo "💡 提示:"
echo "   - FFmpeg等系统级依赖已保留"
echo "   - 源代码和配置文件未受影响"
echo "   - 重新安装会比首次安装更快"