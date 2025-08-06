#!/bin/bash

# 智剪蜂 - 应用停止脚本
# 用于停止正在运行的应用服务

echo "🛑 停止智剪蜂应用..."

# 从文件读取PID
if [ -f ".app_pids" ]; then
    echo "📋 从PID文件读取进程信息..."
    PIDS=$(cat .app_pids)
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo "停止进程 $PID"
            kill $PID
            
            # 等待进程结束
            sleep 2
            
            # 如果进程仍在运行，强制结束
            if kill -0 $PID 2>/dev/null; then
                echo "强制停止进程 $PID"
                kill -9 $PID
            fi
        else
            echo "进程 $PID 已不存在"
        fi
    done
    rm .app_pids
    echo "✅ PID文件已清理"
fi

# 查找并停止相关进程
echo "🔍 查找并停止相关进程..."

# 停止FastAPI进程
FASTAPI_PIDS=$(pgrep -f "uvicorn main:app")
if [ ! -z "$FASTAPI_PIDS" ]; then
    echo "停止FastAPI进程: $FASTAPI_PIDS"
    echo $FASTAPI_PIDS | xargs kill
    sleep 2
    # 强制停止仍在运行的进程
    echo $FASTAPI_PIDS | xargs kill -9 2>/dev/null
fi

# 停止React进程
REACT_PIDS=$(pgrep -f "react-scripts start")
if [ ! -z "$REACT_PIDS" ]; then
    echo "停止React进程: $REACT_PIDS"
    echo $REACT_PIDS | xargs kill
    sleep 2
    # 强制停止仍在运行的进程
    echo $REACT_PIDS | xargs kill -9 2>/dev/null
fi

# 停止npm start进程
NPM_PIDS=$(pgrep -f "npm start")
if [ ! -z "$NPM_PIDS" ]; then
    echo "停止npm进程: $NPM_PIDS"
    echo $NPM_PIDS | xargs kill
    sleep 2
    # 强制停止仍在运行的进程
    echo $NPM_PIDS | xargs kill -9 2>/dev/null
fi

# 检查端口占用
echo "🔍 检查端口占用情况..."
PORT_8000=$(lsof -ti:8000)
if [ ! -z "$PORT_8000" ]; then
    echo "清理端口8000占用: $PORT_8000"
    echo $PORT_8000 | xargs kill -9
fi

PORT_3000=$(lsof -ti:3000)
if [ ! -z "$PORT_3000" ]; then
    echo "清理端口3000占用: $PORT_3000"
    echo $PORT_3000 | xargs kill -9
fi

echo ""
echo "✅ 智剪蜂应用已停止"
echo "📋 清理摘要:"
echo "   ✅ 后端服务已停止"
echo "   ✅ 前端服务已停止"
echo "   ✅ 端口占用已清理"
echo "   ✅ PID文件已删除"
echo ""
echo "🚀 重新启动: ./start_app.sh"
echo "🔧 重新安装环境: ./install_env.sh"