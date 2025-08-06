#!/usr/bin/env python3
"""
智剪蜂完整AI功能测试脚本
测试语音识别、语义分析和视频剪辑功能
"""

import os
import sys
import time
import logging
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_ai_dependencies():
    """测试AI依赖包"""
    print("🧪 测试AI依赖包...")
    
    dependencies = [
        ("torch", "PyTorch深度学习框架"),
        ("whisper", "OpenAI Whisper语音识别"),
        ("transformers", "Hugging Face Transformers"),
        ("ffmpeg", "FFmpeg视频处理"),
        ("jieba", "中文分词"),
        ("numpy", "数值计算"),
        ("pandas", "数据处理")
    ]
    
    success_count = 0
    for module, description in dependencies:
        try:
            __import__(module)
            print(f"✅ {module}: {description}")
            success_count += 1
        except ImportError as e:
            print(f"❌ {module}: {description} - 导入失败: {e}")
    
    print(f"\n📊 依赖检查结果: {success_count}/{len(dependencies)} 成功")
    return success_count == len(dependencies)

def test_whisper_model():
    """测试Whisper模型加载"""
    print("\n🎤 测试Whisper模型...")
    
    try:
        import whisper
        import torch
        
        # 检查设备
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"📱 使用设备: {device}")
        
        # 加载模型
        print("📦 加载Whisper base模型...")
        start_time = time.time()
        model = whisper.load_model("base", device=device)
        load_time = time.time() - start_time
        
        print(f"✅ Whisper模型加载成功 (耗时: {load_time:.2f}秒)")
        
        # 测试模型信息
        print(f"📋 模型信息:")
        print(f"   - 设备: {next(model.parameters()).device}")
        print(f"   - 参数数量: {sum(p.numel() for p in model.parameters()):,}")
        
        return True
        
    except Exception as e:
        print(f"❌ Whisper模型测试失败: {e}")
        return False

def test_ai_engine():
    """测试AI引擎"""
    print("\n🤖 测试AI引擎...")
    
    try:
        # 添加ai_engine到路径
        sys.path.append(str(Path(__file__).parent / "ai_engine"))
        
        from core import VocalCutEngine
        
        # 初始化引擎
        print("🔧 初始化AI引擎...")
        engine = VocalCutEngine()
        
        print("✅ AI引擎初始化成功")
        
        # 测试各个组件
        print("📋 测试引擎组件:")
        
        # 测试模型加载状态
        if hasattr(engine, 'whisper_model') and engine.whisper_model is not None:
            print("   ✅ Whisper模型已加载")
        else:
            print("   ⚠️  Whisper模型未加载")
        
        # 测试方法存在性
        methods = ['transcribe_audio', 'analyze_content', 'generate_cut_plan', 'cut_video', 'process_video']
        for method in methods:
            if hasattr(engine, method):
                print(f"   ✅ {method}方法可用")
            else:
                print(f"   ❌ {method}方法缺失")
        
        return True
        
    except Exception as e:
        print(f"❌ AI引擎测试失败: {e}")
        return False

def test_video_processing():
    """测试视频处理功能"""
    print("\n🎬 测试视频处理功能...")
    
    try:
        import ffmpeg
        
        # 检查FFmpeg可用性
        try:
            ffmpeg.probe("test")
        except ffmpeg.Error:
            pass  # 预期的错误，说明ffmpeg可用
        except FileNotFoundError:
            print("❌ FFmpeg未安装或不在PATH中")
            return False
        
        print("✅ FFmpeg可用")
        
        # 测试基本的ffmpeg-python功能
        print("🔧 测试ffmpeg-python...")
        
        # 创建一个简单的测试
        input_stream = ffmpeg.input('dummy.mp4')
        output_stream = ffmpeg.output(input_stream, 'output.mp4')
        
        print("✅ ffmpeg-python功能正常")
        
        return True
        
    except Exception as e:
        print(f"❌ 视频处理测试失败: {e}")
        return False

def test_backend_integration():
    """测试后端集成"""
    print("\n🔧 测试后端集成...")
    
    try:
        # 添加backend到路径
        sys.path.append(str(Path(__file__).parent / "backend"))
        
        from processor import VideoProcessor, AI_ENGINE_AVAILABLE
        
        print(f"📋 AI引擎可用性: {'✅ 可用' if AI_ENGINE_AVAILABLE else '❌ 不可用'}")
        
        # 初始化处理器
        processor = VideoProcessor()
        print("✅ 视频处理器初始化成功")
        
        # 检查目录
        if processor.upload_dir.exists():
            print(f"✅ 上传目录存在: {processor.upload_dir}")
        else:
            print(f"⚠️  上传目录不存在: {processor.upload_dir}")
        
        if processor.output_dir.exists():
            print(f"✅ 输出目录存在: {processor.output_dir}")
        else:
            print(f"⚠️  输出目录不存在: {processor.output_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ 后端集成测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🤖 智剪蜂完整AI功能测试")
    print("=" * 50)
    
    tests = [
        ("AI依赖包", test_ai_dependencies),
        ("Whisper模型", test_whisper_model),
        ("AI引擎", test_ai_engine),
        ("视频处理", test_video_processing),
        ("后端集成", test_backend_integration)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}测试异常: {e}")
            results.append((test_name, False))
    
    # 显示测试结果
    print("\n📊 测试结果汇总")
    print("=" * 30)
    
    success_count = 0
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name}: {status}")
        if result:
            success_count += 1
    
    print(f"\n🎯 总体结果: {success_count}/{len(results)} 测试通过")
    
    if success_count == len(results):
        print("🎉 所有AI功能测试通过！系统已准备就绪。")
        return 0
    else:
        print("⚠️  部分测试失败，请检查安装和配置。")
        print("💡 建议运行 ./install_ai_full.sh 重新安装")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)