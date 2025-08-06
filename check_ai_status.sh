#!/bin/bash

# 智剪蜂AI功能状态检查脚本

echo "🔍 智剪蜂AI功能状态检查"
echo "=" * 35

# 检查服务状态
echo "📡 服务状态检查:"

# 检查后端服务
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ 后端服务: 运行中 (http://localhost:8000)"
else
    echo "❌ 后端服务: 未运行"
fi

# 检查前端服务
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务: 运行中 (http://localhost:3000)"
else
    echo "❌ 前端服务: 未运行"
fi

# 检查进程
echo ""
echo "🔧 进程状态:"

if [ -f "logs/backend.pid" ]; then
    backend_pid=$(cat logs/backend.pid)
    if ps -p $backend_pid > /dev/null 2>&1; then
        echo "✅ 后端进程: PID $backend_pid"
    else
        echo "❌ 后端进程: PID文件存在但进程未运行"
    fi
else
    echo "ℹ️  后端进程: 无PID文件"
fi

if [ -f "logs/frontend.pid" ]; then
    frontend_pid=$(cat logs/frontend.pid)
    if ps -p $frontend_pid > /dev/null 2>&1; then
        echo "✅ 前端进程: PID $frontend_pid"
    else
        echo "❌ 前端进程: PID文件存在但进程未运行"
    fi
else
    echo "ℹ️  前端进程: 无PID文件"
fi

# 检查AI功能
echo ""
echo "🤖 AI功能状态:"

cd backend 2>/dev/null
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null
    
    # 检查关键AI包
    python -c "
import sys
try:
    import whisper
    print('✅ Whisper: 已安装')
except ImportError:
    print('❌ Whisper: 未安装')

try:
    import torch
    print('✅ PyTorch: 已安装')
except ImportError:
    print('❌ PyTorch: 未安装')

try:
    import transformers
    print('✅ Transformers: 已安装')
except ImportError:
    print('❌ Transformers: 未安装')

try:
    import ffmpeg
    print('✅ FFmpeg-python: 已安装')
except ImportError:
    print('❌ FFmpeg-python: 未安装')
" 2>/dev/null
else
    echo "❌ 虚拟环境: 未找到"
fi

cd .. 2>/dev/null

# 检查目录结构
echo ""
echo "📁 目录状态:"

dirs=("backend/uploads" "backend/outputs" "backend/models" "logs")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        file_count=$(ls -1 "$dir" 2>/dev/null | wc -l)
        echo "✅ $dir: 存在 ($file_count 个文件)"
    else
        echo "❌ $dir: 不存在"
    fi
done

# 检查配置文件
echo ""
echo "⚙️  配置文件:"

if [ -f "backend/.env" ]; then
    echo "✅ 环境配置: backend/.env 存在"
    
    # 显示关键配置
    if grep -q "AI_MODE=full" backend/.env 2>/dev/null; then
        echo "   🤖 AI模式: 完整版"
    else
        echo "   ⚠️  AI模式: 未配置或非完整版"
    fi
    
    whisper_model=$(grep "WHISPER_MODEL=" backend/.env 2>/dev/null | cut -d'=' -f2)
    if [ -n "$whisper_model" ]; then
        echo "   🎤 Whisper模型: $whisper_model"
    fi
    
else
    echo "❌ 环境配置: backend/.env 不存在"
fi

# 检查日志
echo ""
echo "📋 最近日志:"

if [ -f "logs/backend.log" ]; then
    echo "📄 后端日志 (最后5行):"
    tail -5 logs/backend.log 2>/dev/null | sed 's/^/   /'
else
    echo "ℹ️  无后端日志文件"
fi

# 系统资源
echo ""
echo "💻 系统资源:"

# 内存使用
if command -v free &> /dev/null; then
    memory_info=$(free -h | grep "Mem:")
    echo "🧠 内存: $memory_info"
elif command -v vm_stat &> /dev/null; then
    # macOS
    echo "🧠 内存: macOS系统"
fi

# 磁盘空间
disk_usage=$(df -h . | tail -1 | awk '{print $4}')
echo "💾 可用空间: $disk_usage"

# CPU负载
if command -v uptime &> /dev/null; then
    load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo "⚡ CPU负载:$load_avg"
fi

echo ""
echo "🎯 快速操作:"
echo "   启动服务: ./start_ai_full.sh"
echo "   停止服务: ./stop_ai_full.sh"
echo "   测试AI功能: ./test_ai_full.py"
echo "   查看后端日志: tail -f logs/backend.log"
echo "   查看前端日志: tail -f logs/frontend.log"