#!/bin/bash

# 智剪蜂 - 端口冲突解决脚本

echo "🔧 解决端口冲突问题"
echo "=" * 30

# 检查并停止占用端口的进程
echo "📡 检查端口占用情况..."

# 检查8000端口
port_8000_pid=$(lsof -ti:8000)
if [ ! -z "$port_8000_pid" ]; then
    echo "⚠️  端口8000被进程 $port_8000_pid 占用"
    echo "🛑 停止占用8000端口的进程..."
    kill -9 $port_8000_pid 2>/dev/null || true
    sleep 2
    
    # 再次检查
    if lsof -ti:8000 > /dev/null 2>&1; then
        echo "❌ 无法停止8000端口进程，将使用备用端口8001"
        export BACKEND_PORT=8001
    else
        echo "✅ 8000端口已释放"
        export BACKEND_PORT=8000
    fi
else
    echo "✅ 端口8000可用"
    export BACKEND_PORT=8000
fi

# 检查3000端口
port_3000_pid=$(lsof -ti:3000)
if [ ! -z "$port_3000_pid" ]; then
    echo "⚠️  端口3000被进程 $port_3000_pid 占用"
    echo "🛑 停止占用3000端口的进程..."
    kill -9 $port_3000_pid 2>/dev/null || true
    sleep 2
    
    # 再次检查
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo "❌ 无法停止3000端口进程，将使用备用端口3001"
        export FRONTEND_PORT=3001
    else
        echo "✅ 3000端口已释放"
        export FRONTEND_PORT=3000
    fi
else
    echo "✅ 端口3000可用"
    export FRONTEND_PORT=3000
fi

echo ""
echo "🎯 端口配置:"
echo "   后端端口: $BACKEND_PORT"
echo "   前端端口: $FRONTEND_PORT"

# 保存端口配置到环境文件
echo "BACKEND_PORT=$BACKEND_PORT" > .port_config
echo "FRONTEND_PORT=$FRONTEND_PORT" >> .port_config

echo "✅ 端口冲突解决完成"