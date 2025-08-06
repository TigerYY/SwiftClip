#!/bin/bash

# 智剪蜂 - M4芯片性能监控脚本
# 专门监控MacBook Air M4的AI性能表现

echo "🚀 智剪蜂 M4芯片性能监控"
echo "=" * 40

# 检查M4芯片信息
echo "🔍 M4芯片信息:"
chip_info=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "Unknown")
echo "   芯片型号: $chip_info"

# 获取CPU核心信息
performance_cores=$(sysctl -n hw.perflevel0.physicalcpu 2>/dev/null || echo "4")
efficiency_cores=$(sysctl -n hw.perflevel1.physicalcpu 2>/dev/null || echo "4")
echo "   性能核心: $performance_cores 个"
echo "   效率核心: $efficiency_cores 个"

# 内存信息
total_mem_bytes=$(sysctl -n hw.memsize)
total_mem_gb=$((total_mem_bytes / 1024 / 1024 / 1024))
echo "   统一内存: ${total_mem_gb}GB"

# GPU信息
echo ""
echo "🎮 GPU信息:"
system_profiler SPDisplaysDataType | grep -A 5 "Apple M4" | head -10

# 检查AI服务状态
echo ""
echo "🤖 AI服务状态:"

# 检查后端服务
if [ -f "logs/backend.pid" ]; then
    backend_pid=$(cat logs/backend.pid)
    if ps -p $backend_pid > /dev/null 2>&1; then
        echo "✅ 后端服务运行中 (PID: $backend_pid)"
        
        # 检查CPU使用率
        cpu_usage=$(ps -p $backend_pid -o %cpu= | tr -d ' ')
        echo "   CPU使用率: ${cpu_usage}%"
        
        # 检查内存使用
        mem_usage=$(ps -p $backend_pid -o rss= | tr -d ' ')
        mem_mb=$((mem_usage / 1024))
        echo "   内存使用: ${mem_mb}MB"
    else
        echo "❌ 后端服务未运行"
    fi
else
    echo "❌ 后端服务PID文件不存在"
fi

# 检查前端服务
if [ -f "logs/frontend.pid" ]; then
    frontend_pid=$(cat logs/frontend.pid)
    if ps -p $frontend_pid > /dev/null 2>&1; then
        echo "✅ 前端服务运行中 (PID: $frontend_pid)"
    else
        echo "❌ 前端服务未运行"
    fi
else
    echo "❌ 前端服务PID文件不存在"
fi

# 检查端口状态
echo ""
echo "📡 端口状态:"
for port in 8000 3000; do
    if lsof -ti:$port > /dev/null 2>&1; then
        pid=$(lsof -ti:$port)
        echo "✅ 端口 $port 被进程 $pid 占用"
    else
        echo "❌ 端口 $port 未被占用"
    fi
done

# AI性能测试
echo ""
echo "🧪 AI性能测试:"

if [ -d "backend/venv" ]; then
    cd backend
    source venv/bin/activate
    
    # 测试PyTorch MPS性能
    python -c "
import torch
import time
import sys

print('🔥 M4 MPS性能测试:')

if torch.backends.mps.is_available():
    device = torch.device('mps')
    print(f'✅ MPS设备可用: {device}')
    
    # 矩阵乘法性能测试
    size = 2000
    print(f'   测试矩阵大小: {size}x{size}')
    
    # CPU测试
    start_time = time.time()
    x_cpu = torch.randn(size, size)
    y_cpu = torch.mm(x_cpu, x_cpu.t())
    cpu_time = time.time() - start_time
    print(f'   CPU计算时间: {cpu_time:.3f}秒')
    
    # MPS测试
    start_time = time.time()
    x_mps = torch.randn(size, size, device=device)
    y_mps = torch.mm(x_mps, x_mps.t())
    torch.mps.synchronize()  # 等待GPU计算完成
    mps_time = time.time() - start_time
    print(f'   MPS计算时间: {mps_time:.3f}秒')
    
    # 性能提升比
    speedup = cpu_time / mps_time
    print(f'   🚀 MPS加速比: {speedup:.2f}x')
    
    if speedup > 2.0:
        print('   🎉 M4 GPU加速效果优秀！')
    elif speedup > 1.5:
        print('   ✅ M4 GPU加速效果良好')
    else:
        print('   ⚠️  GPU加速效果一般，检查系统负载')
        
else:
    print('❌ MPS不可用')
    sys.exit(1)
" 2>/dev/null || echo "⚠️  AI性能测试需要激活虚拟环境"
    
    cd ..
else
    echo "❌ 虚拟环境不存在，请先运行安装脚本"
fi

# 系统资源监控
echo ""
echo "📊 系统资源监控:"

# CPU温度（如果可用）
if command -v powermetrics &> /dev/null; then
    echo "🌡️  获取CPU温度信息..."
    sudo powermetrics -n 1 -s cpu_power | grep -E "(CPU die temperature|Package Power)" | head -5 2>/dev/null || echo "   需要管理员权限获取详细信息"
fi

# 内存压力
memory_pressure=$(memory_pressure 2>/dev/null | head -1 || echo "正常")
echo "💾 内存压力: $memory_pressure"

# 磁盘使用情况
echo "💿 磁盘使用:"
df -h . | tail -1 | awk '{print "   可用空间: " $4 " / " $2 " (" $5 " 已使用)"}'

# 网络连接测试
echo ""
echo "🌐 网络连接测试:"
if curl -s --connect-timeout 3 http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ 后端API连接正常"
else
    echo "❌ 后端API连接失败"
fi

if curl -s --connect-timeout 3 http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ 前端服务连接正常"
else
    echo "❌ 前端服务连接失败"
fi

# 日志文件大小
echo ""
echo "📋 日志文件状态:"
if [ -f "logs/backend.log" ]; then
    backend_log_size=$(du -h logs/backend.log | cut -f1)
    echo "   后端日志: $backend_log_size"
    
    # 检查最近的错误
    error_count=$(tail -100 logs/backend.log | grep -i error | wc -l | tr -d ' ')
    if [ "$error_count" -gt 0 ]; then
        echo "   ⚠️  最近100行中有 $error_count 个错误"
    else
        echo "   ✅ 最近无错误记录"
    fi
else
    echo "   ❌ 后端日志文件不存在"
fi

if [ -f "logs/frontend.log" ]; then
    frontend_log_size=$(du -h logs/frontend.log | cut -f1)
    echo "   前端日志: $frontend_log_size"
else
    echo "   ❌ 前端日志文件不存在"
fi

echo ""
echo "🎯 M4性能优化建议:"
echo "   1. 确保系统温度适中，避免过热降频"
echo "   2. 关闭不必要的后台应用释放内存"
echo "   3. 使用MPS加速可提升AI推理3-5倍性能"
echo "   4. 大文件处理时建议连接电源适配器"
echo "   5. 定期清理缓存文件释放存储空间"
echo ""
echo "📞 如需帮助，请查看日志文件或联系技术支持"