#!/bin/bash

# 智剪蜂 - 智能启动脚本（使用固定端口）

echo "🤖 智剪蜂智能启动"
echo "=" * 30

# 设置固定端口
BACKEND_PORT=8000
FRONTEND_PORT=3000
echo "📡 使用固定端口: 后端=$BACKEND_PORT, 前端=$FRONTEND_PORT"

# 检查并释放被占用的端口
echo "🔧 检查端口占用情况..."

# 检查后端端口
backend_pid=$(lsof -ti:$BACKEND_PORT)
if [ ! -z "$backend_pid" ]; then
    echo "⚠️  端口 $BACKEND_PORT 被进程 $backend_pid 占用"
    echo "🛑 正在终止占用进程..."
    kill -9 $backend_pid 2>/dev/null || true
    sleep 2
    
    # 再次检查
    if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo "❌ 无法释放端口 $BACKEND_PORT，请手动终止占用进程后重试"
        exit 1
    else
        echo "✅ 端口 $BACKEND_PORT 已成功释放"
    fi
else
    echo "✅ 端口 $BACKEND_PORT 可用"
fi

# 检查前端端口
frontend_pid=$(lsof -ti:$FRONTEND_PORT)
if [ ! -z "$frontend_pid" ]; then
    echo "⚠️  端口 $FRONTEND_PORT 被进程 $frontend_pid 占用"
    echo "🛑 正在终止占用进程..."
    kill -9 $frontend_pid 2>/dev/null || true
    sleep 2
    
    # 再次检查
    if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "❌ 无法释放端口 $FRONTEND_PORT，请手动终止占用进程后重试"
        exit 1
    else
        echo "✅ 端口 $FRONTEND_PORT 已成功释放"
    fi
else
    echo "✅ 端口 $FRONTEND_PORT 可用"
fi

# 检查安装状态
if [ ! -d "backend/venv" ]; then
    echo "❌ 虚拟环境未找到，请先运行 ./install_ai_full.sh"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ 前端依赖未安装，请先运行 ./install_ai_full.sh"
    exit 1
fi

# 设置环境变量
export AI_MODE=full
export WHISPER_MODEL=base
export USE_GPU=false
export HF_ENDPOINT=https://hf-mirror.com

# 创建必要目录
mkdir -p backend/{uploads,outputs,models,logs}
mkdir -p logs

# 启动后端服务
echo "🚀 启动后端AI服务..."
cd backend

# 激活虚拟环境
source venv/bin/activate

# 验证AI依赖（快速检查）
echo "🧪 快速验证AI功能..."
python -c "
try:
    import whisper, torch, transformers
    print('✅ AI依赖验证成功')
except ImportError as e:
    module_name = str(e).split()[-1].strip(\"'\")
    if module_name == 'whisper':
        print(f'❌ AI依赖验证失败: {e}')
        print('💡 提示: 请确保已安装OpenAI Whisper，可以尝试运行:')
        print('   pip install -U openai-whisper')
        print('   或重新运行 ./install_ai_full.sh')
    elif module_name == 'torch':
        print(f'❌ AI依赖验证失败: {e}')
        print('💡 提示: 请确保已安装PyTorch，可以尝试运行:')
        print('   pip install torch')
        print('   或重新运行 ./install_ai_full.sh')
    elif module_name == 'transformers':
        print(f'❌ AI依赖验证失败: {e}')
        print('💡 提示: 请确保已安装Transformers，可以尝试运行:')
        print('   pip install transformers')
        print('   或重新运行 ./install_ai_full.sh')
    else:
        print(f'❌ AI依赖验证失败: {e}')
        print('💡 提示: 请重新运行 ./install_ai_full.sh 安装所有依赖')
    exit(1)
except Exception as e:
    print(f'❌ AI依赖验证失败: {e}')
    print('💡 提示: 请重新运行 ./install_ai_full.sh 安装所有依赖')
    exit(1)
" || exit 1

# 清理旧的PID文件
rm -f ../logs/backend.pid ../logs/frontend.pid

# 启动后端服务（使用动态端口）
echo "🔧 启动FastAPI服务器 (端口: $BACKEND_PORT)..."
nohup python -c "
import uvicorn
from main import app
uvicorn.run(app, host='0.0.0.0', port=$BACKEND_PORT, log_level='info')
" > ../logs/backend.log 2>&1 &

backend_pid=$!
echo $backend_pid > ../logs/backend.pid

# 等待后端启动
echo "⏳ 等待后端服务启动..."
for i in {1..15}; do
    if curl -s http://localhost:$BACKEND_PORT/ > /dev/null 2>&1; then
        echo "✅ 后端服务启动成功 (PID: $backend_pid, 端口: $BACKEND_PORT)"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ 后端服务启动超时"
        echo "📋 查看日志: tail -f logs/backend.log"
        exit 1
    fi
    sleep 2
done

cd ..

# 更新前端配置以使用正确的后端端口
echo "⚙️  更新前端配置..."
if [ $BACKEND_PORT -ne 8000 ]; then
    # 创建临时的环境变量文件给前端使用
    echo "REACT_APP_API_BASE_URL=http://localhost:$BACKEND_PORT" > frontend/.env.local
fi

# 启动前端服务
echo "⚛️  启动前端服务..."
cd frontend

# 启动前端开发服务器（使用固定端口）
nohup npm start > ../logs/frontend.log 2>&1 &

frontend_pid=$!
echo $frontend_pid > ../logs/frontend.pid

echo "⏳ 等待前端服务启动..."
for i in {1..20}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ 前端服务启动成功 (PID: $frontend_pid, 端口: $FRONTEND_PORT)"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "⚠️  前端服务启动可能需要更多时间"
        echo "📋 查看日志: tail -f logs/frontend.log"
        break
    fi
    sleep 3
done

cd ..

# 显示启动信息
echo ""
echo "🎉 智剪蜂AI版本启动完成！"
echo "=" * 40
echo "📱 前端地址: http://localhost:$FRONTEND_PORT"
echo "🔧 后端API: http://localhost:$BACKEND_PORT"
echo "📚 API文档: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "🤖 AI功能说明:"
echo "   - 语音识别: OpenAI Whisper"
echo "   - 语义分析: Transformers + 规则引擎"
echo "   - 智能剪辑: FFmpeg + AI算法"
echo ""
echo "📋 进程信息:"
echo "   - 后端PID: $backend_pid (端口: $BACKEND_PORT)"
echo "   - 前端PID: $frontend_pid (端口: $FRONTEND_PORT)"
echo ""
echo "🔍 监控命令:"
echo "   - 查看后端日志: tail -f logs/backend.log"
echo "   - 查看前端日志: tail -f logs/frontend.log"
echo "   - 检查状态: ./check_ai_status.sh"
echo "   - 停止服务: ./stop_ai_full.sh"
echo ""
echo "💡 脚本使用固定端口，并自动终止占用端口的进程"
echo "🎬 开始使用智剪蜂完整AI功能！"