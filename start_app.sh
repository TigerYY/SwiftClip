#!/bin/bash

# 智剪蜂 - 应用启动脚本
# 用于启动已安装好环境的应用服务

echo "🚀 启动智剪蜂应用..."

# 检查环境是否已安装
if [ ! -d "backend/venv" ]; then
    echo "❌ 错误: 未找到Python虚拟环境"
    echo "💡 请先运行环境安装脚本: ./install_env.sh"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ 错误: 未找到Node.js依赖"
    echo "💡 请先运行环境安装脚本: ./install_env.sh"
    exit 1
fi

# 检查端口占用
echo "🔍 检查端口占用..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告: 端口8000已被占用，可能影响后端服务启动"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告: 端口3000已被占用，可能影响前端服务启动"
fi

# 启动后端服务
echo "🐍 启动Python后端服务..."
cd backend
source venv/bin/activate

# 检查后端依赖
python -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖检查失败，请重新运行 ./install_env.sh"
    exit 1
fi

echo "启动FastAPI服务器..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
echo "等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
else
    echo "❌ 后端服务启动失败，请查看日志: logs/backend.log"
    exit 1
fi

cd ..

# 启动前端服务
echo "⚛️  启动React前端服务..."
cd frontend

echo "启动React开发服务器..."
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
echo "等待前端服务启动..."
sleep 5

# 检查前端是否启动成功
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ 前端服务启动成功 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端服务启动失败，请查看日志: logs/frontend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# 保存PID到文件
echo "$BACKEND_PID $FRONTEND_PID" > .app_pids

echo ""
echo "🎉 智剪蜂应用启动完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 前端应用: http://localhost:3000"
echo "🔧 后端API: http://localhost:8000"
echo "📋 API文档: http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 服务信息:"
echo "   后端PID: $BACKEND_PID"
echo "   前端PID: $FRONTEND_PID"
echo ""
echo "📋 日志文件:"
echo "   后端日志: logs/backend.log"
echo "   前端日志: logs/frontend.log"
echo ""
echo "🛑 停止服务: ./stop_app.sh"
echo "🔄 重启服务: ./stop_app.sh && ./start_app.sh"
echo ""
echo "💡 提示: 首次启动前端可能需要1-2分钟编译，请耐心等待"
echo "🌐 应用启动后会自动在浏览器中打开 http://localhost:3000"