#!/bin/bash

# 智剪蜂 - 增量依赖更新脚本
# 只更新必要的依赖，保留已安装的包

echo "🔄 智剪蜂增量依赖更新"
echo "=" * 30

# 检查虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "❌ 虚拟环境不存在，请先运行 ./install_ai_full.sh"
    exit 1
fi

cd backend
source venv/bin/activate

echo "📋 当前已安装的包:"
pip list --format=columns | head -10
echo "..."

# 创建包检查函数
check_and_install() {
    local package=$1
    local version=$2
    local import_name=${3:-$package}
    
    if python -c "import $import_name" >/dev/null 2>&1; then
        current_version=$(python -c "import $import_name; print(getattr($import_name, '__version__', 'unknown'))" 2>/dev/null || echo "unknown")
        echo "✅ $package 已安装 (版本: $current_version)"
        return 0
    else
        echo "❌ $package 未安装，需要安装"
        return 1
    fi
}

# 检查核心依赖
echo ""
echo "🔍 检查核心AI依赖:"

packages_to_check=(
    "torch:torch"
    "whisper:whisper" 
    "transformers:transformers"
    "fastapi:fastapi"
    "uvicorn:uvicorn"
    "numpy:numpy"
    "pandas:pandas"
)

missing_packages=()

for pkg_info in "${packages_to_check[@]}"; do
    IFS=':' read -r pkg_name import_name <<< "$pkg_info"
    if ! check_and_install "$pkg_name" "" "$import_name"; then
        missing_packages+=("$pkg_name")
    fi
done

# 如果有缺失的包，询问是否安装
if [ ${#missing_packages[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  发现缺失的包: ${missing_packages[*]}"
    read -p "是否安装缺失的包？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 安装缺失的依赖..."
        
        for pkg in "${missing_packages[@]}"; do
            case $pkg in
                "torch")
                    echo "🔥 安装PyTorch..."
                    if [[ "$(uname -m)" == "arm64" ]] && [[ "$OSTYPE" == "darwin"* ]]; then
                        pip install torch>=2.2.0 torchaudio>=2.2.0 torchvision>=0.17.0
                    else
                        pip install torch torchaudio torchvision
                    fi
                    ;;
                "whisper")
                    echo "🎤 安装OpenAI Whisper..."
                    pip install openai-whisper
                    ;;
                "transformers")
                    echo "🤖 安装Transformers..."
                    pip install transformers>=4.37.0
                    ;;
                "fastapi")
                    echo "⚡ 安装FastAPI..."
                    pip install fastapi uvicorn[standard] python-multipart
                    ;;
                "numpy"|"pandas")
                    echo "📊 安装数据处理库..."
                    pip install numpy pandas scipy scikit-learn
                    ;;
                *)
                    echo "📦 安装 $pkg..."
                    pip install "$pkg"
                    ;;
            esac
        done
    else
        echo "跳过安装，退出更新"
        exit 0
    fi
fi

# 检查是否需要更新
echo ""
echo "🔄 检查包更新:"

# 检查过时的包
outdated_packages=$(pip list --outdated --format=json 2>/dev/null | python -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for pkg in data:
        if pkg['name'] in ['torch', 'transformers', 'whisper', 'fastapi', 'numpy', 'pandas']:
            print(f\"{pkg['name']} {pkg['version']} -> {pkg['latest_version']}\")
except:
    pass
" 2>/dev/null)

if [ -n "$outdated_packages" ]; then
    echo "📋 可更新的核心包:"
    echo "$outdated_packages"
    echo ""
    read -p "是否更新这些包？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "⬆️  更新包..."
        pip install --upgrade torch transformers fastapi uvicorn numpy pandas scipy
        echo "✅ 更新完成"
    else
        echo "跳过更新"
    fi
else
    echo "✅ 所有核心包都是最新版本"
fi

# 清理缓存
echo ""
echo "🧹 清理pip缓存..."
pip cache purge >/dev/null 2>&1 || true

# 验证安装
echo ""
echo "🧪 验证AI功能..."
python -c "
import sys
success = True

try:
    import torch
    print(f'✅ PyTorch: {torch.__version__}')
    if torch.backends.mps.is_available():
        print('   🚀 MPS加速可用')
    else:
        print('   💻 使用CPU模式')
except ImportError:
    print('❌ PyTorch导入失败')
    success = False

try:
    import whisper
    print('✅ OpenAI Whisper可用')
except ImportError:
    print('❌ Whisper导入失败')
    success = False

try:
    import transformers
    print(f'✅ Transformers: {transformers.__version__}')
except ImportError:
    print('❌ Transformers导入失败')
    success = False

try:
    import fastapi
    print(f'✅ FastAPI: {fastapi.__version__}')
except ImportError:
    print('❌ FastAPI导入失败')
    success = False

if success:
    print('🎉 所有AI依赖验证成功！')
else:
    print('⚠️  部分依赖存在问题')
    sys.exit(1)
"

cd ..

echo ""
echo "📋 更新总结:"
echo "   ✅ 保留了现有的虚拟环境"
echo "   ✅ 只安装/更新了必要的包"
echo "   ✅ 清理了pip缓存"
echo "   ✅ 验证了AI功能"
echo ""
echo "💡 提示:"
echo "   - 如需完全重新安装，请运行 ./install_ai_full.sh"
echo "   - 如需启动服务，请运行 ./start_ai_m4.sh (M4芯片) 或 ./start_ai_smart.sh"
echo "   - 如需检查状态，请运行 ./check_m4_performance.sh"
echo ""
echo "🎉 增量更新完成！"