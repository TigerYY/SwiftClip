#!/bin/bash

# 智剪蜂 - 网络问题修复脚本
# 解决Whisper模型下载和网络连接问题

echo "🌐 智剪蜂网络问题诊断和修复"
echo "=" * 35

# 检查网络连接
echo "🔍 检查网络连接..."

# 检查基本网络连接
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "✅ 基本网络连接正常"
else
    echo "❌ 网络连接异常，请检查网络设置"
    exit 1
fi

# 检查GitHub连接
echo "🔗 检查GitHub连接..."
if curl -s --connect-timeout 5 https://github.com >/dev/null 2>&1; then
    echo "✅ GitHub连接正常"
else
    echo "⚠️  GitHub连接异常，可能影响模型下载"
fi

# 检查Hugging Face镜像连接
echo "🤗 检查Hugging Face镜像连接..."
if curl -s --connect-timeout 5 https://hf-mirror.com >/dev/null 2>&1; then
    echo "✅ Hugging Face镜像连接正常"
else
    echo "⚠️  Hugging Face镜像连接异常"
fi

# 检查OpenAI模型下载地址
echo "🎤 检查OpenAI模型下载..."
if curl -s --connect-timeout 10 -I https://openaipublic.azureedge.net/main/whisper/models/ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e/base.pt >/dev/null 2>&1; then
    echo "✅ Whisper模型下载地址可访问"
else
    echo "⚠️  Whisper模型下载地址连接异常"
    echo "💡 建议使用代理或稍后重试"
fi

# 设置环境变量
echo ""
echo "⚙️  配置网络环境变量..."

# 创建临时环境配置
cat > /tmp/network_env.sh << 'EOF'
# 网络优化环境变量
export HF_ENDPOINT=https://hf-mirror.com
export HUGGINGFACE_HUB_CACHE=~/.cache/huggingface
export TRANSFORMERS_OFFLINE=0
export HF_HUB_DOWNLOAD_TIMEOUT=300
export WHISPER_DOWNLOAD_ROOT=~/.cache/whisper
export PYTHONWARNINGS=ignore::FutureWarning
export TOKENIZERS_PARALLELISM=false

# 网络代理设置（如果需要）
# export HTTP_PROXY=http://127.0.0.1:7890
# export HTTPS_PROXY=http://127.0.0.1:7890
EOF

echo "✅ 网络环境变量配置完成"

# 预创建缓存目录
echo "📁 创建模型缓存目录..."
mkdir -p ~/.cache/whisper
mkdir -p ~/.cache/huggingface
mkdir -p ~/.cache/huggingface/transformers
echo "✅ 缓存目录创建完成"

# 检查磁盘空间
echo ""
echo "💾 检查磁盘空间..."
available_space=$(df -h ~/.cache | tail -1 | awk '{print $4}')
echo "缓存目录可用空间: $available_space"

# 提供解决方案
echo ""
echo "🔧 网络问题解决方案:"
echo ""
echo "1. 如果Whisper模型下载失败："
echo "   - 检查网络连接是否稳定"
echo "   - 尝试使用VPN或代理"
echo "   - 手动下载模型文件到 ~/.cache/whisper/"
echo ""
echo "2. 如果Transformers下载失败："
echo "   - 使用国内镜像: export HF_ENDPOINT=https://hf-mirror.com"
echo "   - 检查防火墙设置"
echo ""
echo "3. 如果启动时出现连接错误："
echo "   - 设置 SKIP_MODEL_PRELOAD=true 跳过预加载"
echo "   - 使用离线模式启动"
echo ""

# 提供手动下载脚本
echo "📥 创建手动下载脚本..."
cat > download_models_manual.sh << 'EOF'
#!/bin/bash
# 手动下载Whisper模型

echo "📥 手动下载Whisper base模型..."
mkdir -p ~/.cache/whisper

# 下载base模型
curl -L -o ~/.cache/whisper/base.pt \
  "https://openaipublic.azureedge.net/main/whisper/models/ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e/base.pt"

if [ $? -eq 0 ]; then
    echo "✅ Whisper base模型下载成功"
else
    echo "❌ 下载失败，请检查网络连接"
fi
EOF

chmod +x download_models_manual.sh
echo "✅ 手动下载脚本已创建: ./download_models_manual.sh"

# 修复启动脚本
echo ""
echo "🔧 修复启动配置..."

# 更新M4启动脚本的环境变量
if [ -f "start_ai_m4.sh" ]; then
    # 在启动脚本中添加网络环境变量
    if ! grep -q "SKIP_MODEL_PRELOAD" start_ai_m4.sh; then
        sed -i '' '/export HIGH_PERFORMANCE_MODE=true/a\
export SKIP_MODEL_PRELOAD=true\
export PYTHONWARNINGS=ignore::FutureWarning\
export HF_ENDPOINT=https://hf-mirror.com
' start_ai_m4.sh 2>/dev/null || true
    fi
    echo "✅ M4启动脚本已更新"
fi

echo ""
echo "🎉 网络问题修复完成！"
echo ""
echo "💡 建议的启动顺序："
echo "1. source /tmp/network_env.sh  # 加载网络环境变量"
echo "2. ./start_ai_m4.sh           # 启动M4优化版本"
echo ""
echo "如果仍有问题，请运行 ./download_models_manual.sh 手动下载模型"