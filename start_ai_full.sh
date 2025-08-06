#!/bin/bash

# 智剪蜂 - 完整AI功能启动脚本
# 启动包含真实AI功能的完整版本

echo "🤖 启动智剪蜂完整AI版本"
echo "=" * 40

# 检查安装状态
if [ ! -d "backend/venv" ]; then
    echo "❌ 虚拟环境未找到，请先运行 ./install_ai_full.sh"
    exit 1
fi

# 检查前端依赖
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

# 验证AI依赖
echo "🧪 验证AI功能..."
python -c "
import sys
try:
    import whisper
    import torch
    import transformers
    print('✅ AI依赖验证成功')
    
    # 检查模型可用性
    print('📦 检查AI模型...')
    model = whisper.load_model('base')
    print('✅ Whisper模型加载成功')
    
except Exception as e:
    print(f'❌ AI依赖验证失败: {e}')
    print('💡 请运行 ./install_ai_full.sh 重新安装')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ AI功能验证失败，退出启动"
    exit 1
fi

# 启动后端服务（后台运行）
echo "🔧 启动FastAPI服务器..."
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
backend_pid=$!
echo $backend_pid > ../logs/backend.pid

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功 (PID: $backend_pid)"
else
    echo "❌ 后端服务启动失败"
    echo "📋 查看日志: tail -f logs/backend.log"
    exit 1
fi

cd ..

# 启动前端服务
echo "⚛️  启动前端服务..."
cd frontend

# 启动前端开发服务器（后台运行）
nohup npm start > ../logs/frontend.log 2>&1 &
frontend_pid=$!
echo $frontend_pid > ../logs/frontend.pid

echo "⏳ 等待前端服务启动..."
sleep 10

# 检查前端是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务启动成功 (PID: $frontend_pid)"
else
    echo "❌ 前端服务启动失败"
    echo "📋 查看日志: tail -f logs/frontend.log"
fi

cd ..

# 显示启动信息
echo ""
echo "🎉 智剪蜂完整AI版本启动完成！"
echo "=" * 40
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo ""
echo "🤖 AI功能说明:"
echo "   - 语音识别: OpenAI Whisper"
echo "   - 语义分析: Transformers + 规则引擎"
echo "   - 智能剪辑: FFmpeg + AI算法"
echo ""
echo "📋 进程信息:"
echo "   - 后端PID: $backend_pid"
echo "   - 前端PID: $frontend_pid"
echo ""
echo "🔍 监控命令:"
echo "   - 查看后端日志: tail -f logs/backend.log"
echo "   - 查看前端日志: tail -f logs/frontend.log"
echo "   - 停止服务: ./stop_ai_full.sh"
echo ""
echo "💡 使用提示:"
echo "   1. 首次使用时AI模型加载需要1-2分钟"
echo "   2. 支持mp4、avi、mov等常见视频格式"
echo "   3. 建议视频时长在1小时以内以获得最佳性能"
echo ""
echo "🎬 开始使用智剪蜂完整AI功能！"