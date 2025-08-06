#!/bin/bash

# 智剪蜂 - 完整AI功能停止脚本

echo "🛑 停止智剪蜂完整AI版本"
echo "=" * 30

# 停止后端服务
if [ -f "logs/backend.pid" ]; then
    backend_pid=$(cat logs/backend.pid)
    if ps -p $backend_pid > /dev/null 2>&1; then
        echo "🔧 停止后端服务 (PID: $backend_pid)..."
        kill $backend_pid
        sleep 2
        
        # 强制停止（如果需要）
        if ps -p $backend_pid > /dev/null 2>&1; then
            echo "⚠️  强制停止后端服务..."
            kill -9 $backend_pid
        fi
        
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  后端服务未运行"
    fi
    rm -f logs/backend.pid
else
    echo "ℹ️  未找到后端PID文件"
fi

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    frontend_pid=$(cat logs/frontend.pid)
    if ps -p $frontend_pid > /dev/null 2>&1; then
        echo "⚛️  停止前端服务 (PID: $frontend_pid)..."
        kill $frontend_pid
        sleep 2
        
        # 强制停止（如果需要）
        if ps -p $frontend_pid > /dev/null 2>&1; then
            echo "⚠️  强制停止前端服务..."
            kill -9 $frontend_pid
        fi
        
        echo "✅ 前端服务已停止"
    else
        echo "ℹ️  前端服务未运行"
    fi
    rm -f logs/frontend.pid
else
    echo "ℹ️  未找到前端PID文件"
fi

# 清理可能残留的进程
echo "🧹 清理残留进程..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

echo ""
echo "✅ 智剪蜂完整AI版本已停止"
echo "📋 日志文件保留在 logs/ 目录中"