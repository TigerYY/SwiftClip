#!/bin/bash

# 智剪蜂 - 完整AI功能安装脚本
# 包含OpenAI Whisper、Transformers等真实AI依赖

echo "🤖 智剪蜂完整AI功能安装"
echo "=" * 40

# 检查系统要求
echo "📋 检查系统要求..."

# 检查Python版本（需要3.8+）
python_version=$(python3 -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
echo "Python版本: $python_version"

if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
    echo "✅ Python版本符合要求"
else
    echo "❌ Python版本过低，需要3.8或更高版本"
    exit 1
fi

# 检查系统架构
arch=$(uname -m)
echo "系统架构: $arch"

# 检查Apple Silicon芯片类型
if [[ "$OSTYPE" == "darwin"* ]] && [[ "$arch" == "arm64" ]]; then
    # 检测具体的Apple芯片
    chip_info=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "Apple Silicon")
    echo "芯片信息: $chip_info"
    
    # 检测是否为M4芯片
    if echo "$chip_info" | grep -q "M4"; then
        echo "🚀 检测到Apple M4芯片 - 启用高性能AI优化"
        export APPLE_M4_OPTIMIZED=true
        export MPS_AVAILABLE=true
        export HIGH_PERFORMANCE_MODE=true
    elif echo "$chip_info" | grep -qE "M[1-3]"; then
        echo "🍎 检测到Apple Silicon芯片 - 启用MPS加速"
        export MPS_AVAILABLE=true
        export HIGH_PERFORMANCE_MODE=true
    else
        echo "🍎 检测到Apple Silicon芯片"
        export MPS_AVAILABLE=true
    fi
fi

# 检查可用内存（AI模型需要较多内存）
if command -v vm_stat &> /dev/null; then
    # macOS - 获取更精确的内存信息
    total_mem_bytes=$(sysctl -n hw.memsize)
    total_mem_gb=$((total_mem_bytes / 1024 / 1024 / 1024))
    echo "系统内存: ${total_mem_gb}GB"
    
    # M4芯片通常配备更多统一内存
    if [ "$total_mem_gb" -ge 16 ]; then
        echo "✅ 内存充足，可以加载大型AI模型"
        export LARGE_MODEL_SUPPORT=true
    elif [ "$total_mem_gb" -ge 8 ]; then
        echo "✅ 内存适中，推荐使用中等大小的AI模型"
        export MEDIUM_MODEL_SUPPORT=true
    else
        echo "⚠️  内存较少，建议使用轻量级AI模型"
    fi
elif command -v free &> /dev/null; then
    total_mem=$(free -g | awk '/^Mem:/{print $2}')
    echo "系统内存: ${total_mem}GB"
    if [ "$total_mem" -lt 4 ]; then
        echo "⚠️  警告: 系统内存较少，AI模型加载可能较慢"
    fi
fi

# 检查磁盘空间（AI模型文件较大）
available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
echo "可用磁盘空间: ${available_space}GB"
# 确保available_space是一个数字
if [[ ! "$available_space" =~ ^[0-9]+$ ]]; then
    echo "⚠️  警告: 无法确定可用磁盘空间"
    available_space=0
fi

if [ "$available_space" -lt 10 ]; then
    echo "⚠️  警告: 磁盘空间不足，建议至少10GB空闲空间"
    read -p "是否继续安装？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查FFmpeg
echo "🎬 检查FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    ffmpeg_version=$(ffmpeg -version | head -n1)
    echo "✅ FFmpeg已安装: $ffmpeg_version"
else
    echo "❌ FFmpeg未安装，这是视频处理的必需依赖"
    echo "💡 正在尝试自动安装FFmpeg..."
    
    # 检测操作系统并尝试安装
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "检测到macOS系统，尝试使用Homebrew安装..."
        if command -v brew &> /dev/null; then
            echo "🍺 使用Homebrew安装FFmpeg..."
            # 更新brew并清理缓存
            brew update
            brew cleanup
            
            # 尝试安装FFmpeg，如果失败则尝试其他方法
            if ! brew install ffmpeg; then
                echo "⚠️  Homebrew安装失败，尝试使用conda安装..."
                if command -v conda &> /dev/null; then
                    conda install -c conda-forge ffmpeg -y
                elif command -v pip3 &> /dev/null; then
                    echo "⚠️  尝试使用ffmpeg-python替代方案..."
                    pip3 install ffmpeg-python
                    echo "⚠️  注意：这只是Python绑定，仍需要系统级FFmpeg"
                    echo "💡 请手动安装FFmpeg："
                    echo "   1. 访问 https://ffmpeg.org/download.html"
                    echo "   2. 下载macOS版本并安装"
                    echo "   3. 或者修复Homebrew网络问题后重试"
                fi
            fi
        else
            echo "❌ 未找到Homebrew，请先安装Homebrew或手动安装FFmpeg"
            echo "💡 安装Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "💡 或手动安装FFmpeg: https://ffmpeg.org/download.html"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "检测到Linux系统..."
        if command -v apt &> /dev/null; then
            echo "🐧 使用apt安装FFmpeg..."
            sudo apt update && sudo apt install -y ffmpeg
        elif command -v yum &> /dev/null; then
            echo "🐧 使用yum安装FFmpeg..."
            sudo yum install -y epel-release && sudo yum install -y ffmpeg
        elif command -v dnf &> /dev/null; then
            echo "🐧 使用dnf安装FFmpeg..."
            sudo dnf install -y ffmpeg
        else
            echo "❌ 未找到包管理器，请手动安装FFmpeg"
        fi
    else
        echo "❌ 未识别的操作系统，请手动安装FFmpeg"
    fi
    
    # 再次检查FFmpeg是否安装成功
    if command -v ffmpeg &> /dev/null; then
        ffmpeg_version=$(ffmpeg -version | head -n1)
        echo "✅ FFmpeg安装成功: $ffmpeg_version"
    else
        echo "❌ FFmpeg自动安装失败"
        echo "💡 解决方案："
        echo "   1. 检查网络连接"
        echo "   2. 手动安装FFmpeg: https://ffmpeg.org/download.html"
        echo "   3. 如果是macOS，可以尝试："
        echo "      - brew doctor 检查Homebrew问题"
        echo "      - brew cleanup 清理缓存"
        echo "      - 使用VPN或更换网络环境"
        echo ""
        read -p "是否继续安装（某些视频功能可能不可用）？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        echo "⚠️  继续安装，但视频处理功能可能受限"
    fi
fi

# 创建必要目录
echo "📁 创建项目目录..."
mkdir -p backend/{uploads,outputs,models} logs
mkdir -p ~/.cache/whisper  # Whisper模型缓存目录

# 配置国内镜像源
echo "🌐 配置镜像源..."
pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip3 config set install.trusted-host pypi.tuna.tsinghua.edu.cn

# 配置Hugging Face镜像（用于下载Transformers模型）
export HF_ENDPOINT=https://hf-mirror.com
echo "export HF_ENDPOINT=https://hf-mirror.com" >> ~/.bashrc

echo "✅ 镜像源配置完成"

# 进入后端目录
cd backend

# 创建或检查虚拟环境
echo "🐍 检查Python虚拟环境..."
if [ -d "venv" ]; then
    echo "✅ 虚拟环境已存在，检查是否需要更新..."
    source venv/bin/activate
    
    # 检查Python版本是否匹配
    current_python=$(python -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
    system_python=$(python3 -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
    
    if [ "$current_python" != "$system_python" ]; then
        echo "⚠️  Python版本不匹配 (虚拟环境: $current_python, 系统: $system_python)"
        echo "🔄 重新创建虚拟环境..."
        deactivate 2>/dev/null || true
        rm -rf venv
        python3 -m venv venv
        source venv/bin/activate
    else
        echo "✅ Python版本匹配，保留现有虚拟环境"
    fi
else
    echo "📦 创建新的虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
fi

# 检查并升级pip和基础工具
echo "⬆️  检查pip和基础工具..."
pip install --upgrade pip setuptools wheel --quiet

# 创建依赖检查函数
check_package() {
    local package=$1
    local version=$2
    if [ -n "$version" ]; then
        python -c "import $package; print('✅ $package 已安装')" 2>/dev/null
    else
        python -c "import $package; print('✅ $package 已安装')" 2>/dev/null
    fi
}

# 智能依赖安装
echo "📦 智能检查和安装AI依赖包..."

# 第一阶段：基础Web框架
echo "1/6 检查Web框架..."
need_install=false

if ! check_package "fastapi" >/dev/null 2>&1; then
    echo "   需要安装 fastapi"
    need_install=true
fi

if ! check_package "uvicorn" >/dev/null 2>&1; then
    echo "   需要安装 uvicorn"
    need_install=true
fi

if ! python -c "import multipart" >/dev/null 2>&1; then
    echo "   需要安装 python-multipart"
    need_install=true
fi

if [ "$need_install" = true ]; then
    echo "   🔄 安装Web框架..."
    pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6
    if [ $? -ne 0 ]; then
        echo "❌ Web框架安装失败"
        exit 1
    fi
else
    echo "   ✅ Web框架已安装，跳过"
fi

# 第二阶段：基础工具库
echo "2/6 检查基础工具库..."
need_install=false

for pkg in "requests" "dotenv" "tqdm"; do
    if ! check_package "$pkg" >/dev/null 2>&1; then
        echo "   需要安装 $pkg"
        need_install=true
    fi
done

if [ "$need_install" = true ]; then
    echo "   🔄 安装基础工具库..."
    pip install requests==2.31.0 python-dotenv==1.0.0 tqdm==4.66.1
    if [ $? -ne 0 ]; then
        echo "❌ 基础工具库安装失败"
        exit 1
    fi
else
    echo "   ✅ 基础工具库已安装，跳过"
fi

# 第三阶段：数据处理库
echo "3/6 安装数据处理库..."
echo "   检测Python版本并选择兼容的包版本..."

# 获取Python版本
python_major=$(python3 -c "import sys; print(sys.version_info.major)")
python_minor=$(python3 -c "import sys; print(sys.version_info.minor)")

if [ "$python_major" -eq 3 ] && [ "$python_minor" -ge 12 ]; then
    # Python 3.12+ 使用更新的版本
    echo "   检测到Python 3.12+，使用兼容版本..."
    pip install numpy>=1.26.0 pandas>=2.1.0 scipy>=1.11.0 scikit-learn>=1.3.0
else
    # Python 3.8-3.11 使用指定版本
    echo "   使用标准版本..."
    pip install numpy==1.24.3 pandas==2.0.3 scipy==1.11.4 scikit-learn==1.3.2
fi

if [ $? -ne 0 ]; then
    echo "⚠️  数据处理库安装失败，尝试使用最新版本..."
    pip install numpy pandas scipy scikit-learn
    if [ $? -ne 0 ]; then
        echo "❌ 数据处理库安装失败，但可以继续安装其他组件"
        echo "💡 您可以稍后手动安装: pip install numpy pandas scipy scikit-learn"
    fi
fi

# 第四阶段：PyTorch（AI框架核心）
echo "4/6 安装PyTorch..."
echo "   这可能需要几分钟时间，请耐心等待..."

# 根据系统和芯片选择最优的PyTorch版本
if [[ "$OSTYPE" == "darwin"* ]] && [[ "$arch" == "arm64" ]]; then
    # Apple Silicon优化安装
    if [[ "$APPLE_M4_OPTIMIZED" == "true" ]]; then
        echo "🚀 为Apple M4芯片安装最新优化版本的PyTorch..."
        # M4芯片使用最新版本以获得最佳性能
        pip install torch>=2.2.0 torchaudio>=2.2.0 torchvision>=0.17.0
        
        # 安装Apple Silicon专用的加速库
        pip install accelerate>=0.25.0
        
        if [ $? -eq 0 ]; then
            echo "✅ M4优化版PyTorch安装成功"
            export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0  # M4内存优化
        else
            echo "⚠️  M4优化版本安装失败，尝试稳定版本..."
            pip install torch==2.1.1 torchaudio==2.1.1 torchvision==0.16.1
        fi
    else
        echo "🍎 为Apple Silicon安装PyTorch..."
        # 其他Apple Silicon芯片使用稳定版本
        pip install torch==2.1.1 torchaudio==2.1.1 torchvision==0.16.1
    fi
    
    # 验证MPS支持
    python -c "
import torch
if torch.backends.mps.is_available():
    print('✅ MPS (Metal Performance Shaders) 可用 - GPU加速已启用')
    print(f'   MPS设备: {torch.backends.mps.is_built()}')
else:
    print('⚠️  MPS不可用，将使用CPU模式')
" 2>/dev/null || echo "PyTorch验证将在安装完成后进行"

elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Intel Mac
    echo "🖥️  为Intel Mac安装PyTorch..."
    pip install torch==2.1.1 torchaudio==2.1.1 torchvision==0.16.1
else
    # Linux
    echo "🐧 为Linux安装PyTorch..."
    pip install torch==2.1.1 torchaudio==2.1.1 torchvision==0.16.1 --index-url https://download.pytorch.org/whl/cpu
fi

if [ $? -ne 0 ]; then
    echo "❌ PyTorch安装失败"
    echo "💡 尝试使用基础CPU版本..."
    pip install torch torchaudio torchvision --index-url https://download.pytorch.org/whl/cpu
    if [ $? -ne 0 ]; then
        echo "❌ PyTorch CPU版本也安装失败"
        exit 1
    fi
fi

# 第五阶段：AI模型库
echo "5/6 安装AI模型库..."
echo "   正在安装Transformers和Whisper，这可能需要较长时间..."

# 安装Transformers
pip install transformers==4.36.2
if [ $? -ne 0 ]; then
    echo "❌ Transformers安装失败"
    exit 1
fi

# 安装OpenAI Whisper（使用兼容版本）
echo "   安装OpenAI Whisper..."
if [ "$python_major" -eq 3 ] && [ "$python_minor" -ge 12 ]; then
    echo "   为Python 3.12+安装兼容的Whisper版本..."
    pip install openai-whisper
else
    pip install openai-whisper==20231117
fi

if [ $? -ne 0 ]; then
    echo "⚠️  OpenAI Whisper安装失败，尝试最新版本..."
    pip install openai-whisper
    if [ $? -ne 0 ]; then
        echo "❌ OpenAI Whisper安装失败"
        exit 1
    fi
fi

# 第六阶段：音频和视频处理
echo "6/6 安装音频视频处理库..."
echo "   安装音频视频处理依赖..."

# 使用兼容版本的音频处理库
if [ "$python_major" -eq 3 ] && [ "$python_minor" -ge 12 ]; then
    pip install ffmpeg-python librosa soundfile
else
    pip install ffmpeg-python==0.2.0 librosa==0.10.1 soundfile==0.12.1
fi

if [ $? -ne 0 ]; then
    echo "⚠️  音频视频处理库安装失败，但核心功能仍可使用"
    echo "💡 您可以稍后手动安装: pip install ffmpeg-python librosa soundfile"
fi

# 安装中文处理库
echo "📝 安装中文处理库..."
pip install jieba>=0.42.1
if [ $? -ne 0 ]; then
    echo "⚠️  中文处理库安装失败"
fi

# 安装其他可选依赖（使用兼容版本）
echo "🔧 安装其他依赖..."
if [ "$python_major" -eq 3 ] && [ "$python_minor" -ge 12 ]; then
    pip install pydantic>=2.5.0 pydantic-settings>=2.1.0 sqlalchemy>=2.0.0
else
    pip install pydantic==2.5.2 pydantic-settings==2.1.0 sqlalchemy==2.0.23
fi

# 预下载AI模型
echo "🤖 预下载AI模型..."
echo "   正在下载Whisper base模型，这可能需要几分钟..."

python -c "
import whisper
try:
    model = whisper.load_model('base')
    print('✅ Whisper base模型下载成功')
except Exception as e:
    print(f'⚠️  Whisper模型下载失败: {e}')
    print('模型将在首次使用时自动下载')
"

# 验证安装
echo "🧪 验证AI功能安装..."
python -c "
import sys
success = True

# 检查核心依赖
try:
    import fastapi
    import uvicorn
    print('✅ Web框架正常')
except ImportError as e:
    print(f'❌ Web框架异常: {e}')
    success = False

# 检查AI依赖
try:
    import torch
    print(f'✅ PyTorch正常 (版本: {torch.__version__})')
except ImportError as e:
    print(f'❌ PyTorch异常: {e}')
    success = False

try:
    import whisper
    print('✅ OpenAI Whisper正常')
except ImportError as e:
    print(f'❌ Whisper异常: {e}')
    success = False

try:
    import transformers
    print(f'✅ Transformers正常 (版本: {transformers.__version__})')
except ImportError as e:
    print(f'❌ Transformers异常: {e}')
    success = False

try:
    import ffmpeg
    print('✅ FFmpeg-python正常')
except ImportError as e:
    print(f'⚠️  FFmpeg-python异常: {e}')

try:
    import numpy as np
    import pandas as pd
    print('✅ 数据处理库正常')
except ImportError as e:
    print(f'❌ 数据处理库异常: {e}')
    success = False

if success:
    print('🎉 AI功能验证成功！')
    sys.exit(0)
else:
    print('⚠️  部分AI功能可能不可用')
    sys.exit(1)
"

ai_check_result=$?

cd ..

# 安装前端依赖
echo "⚛️  安装前端依赖..."
cd frontend
npm config set registry https://registry.npmmirror.com
npm install
frontend_result=$?
cd ..

# 创建环境配置
echo "⚙️  创建环境配置..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    
    # 添加AI相关配置
    cat >> backend/.env << EOF

# AI模型配置
WHISPER_MODEL=base
USE_GPU=false
AI_MODE=full
HUGGINGFACE_CACHE_DIR=~/.cache/huggingface
WHISPER_CACHE_DIR=~/.cache/whisper

# 处理配置
MAX_WORKERS=2
CHUNK_SIZE=30
OVERLAP_SIZE=5
EOF
    
    echo "✅ 环境配置文件已创建并添加AI配置"
fi

# 安装总结
echo ""
echo "📋 完整AI功能安装总结:"
echo "=" * 40

if [ $ai_check_result -eq 0 ]; then
    echo "✅ 后端AI依赖: 安装成功"
    echo "   - OpenAI Whisper: 语音识别"
    echo "   - Transformers: 自然语言处理"
    echo "   - PyTorch: 深度学习框架"
    echo "   - FFmpeg: 视频处理"
else
    echo "⚠️  后端AI依赖: 部分安装失败"
fi

if [ $frontend_result -eq 0 ]; then
    echo "✅ 前端依赖: 安装成功"
else
    echo "⚠️  前端依赖: 安装失败"
fi

echo ""
echo "🚀 启动说明:"
echo "   1. 运行 ./start_app.sh 启动应用"
echo "   2. 首次运行时AI模型会自动下载"
echo "   3. 访问 http://localhost:3000 使用完整AI功能"
echo ""
echo "💡 注意事项:"
echo "   - AI模型首次加载需要1-2分钟"
echo "   - 建议使用较新的CPU以获得更好性能"
echo "   - 如有GPU可修改.env中USE_GPU=true"
echo ""
echo "🎉 完整AI功能安装完成！"