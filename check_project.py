#!/usr/bin/env python3
"""
智剪蜂项目完整性检查脚本
用于验证项目文件和配置是否正确
"""

import os
import sys
from pathlib import Path
import json

def check_file_exists(file_path, description):
    """检查文件是否存在"""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (文件不存在)")
        return False

def check_directory_exists(dir_path, description):
    """检查目录是否存在"""
    if os.path.exists(dir_path) and os.path.isdir(dir_path):
        print(f"✅ {description}: {dir_path}")
        return True
    else:
        print(f"❌ {description}: {dir_path} (目录不存在)")
        return False

def check_python_syntax(file_path):
    """检查Python文件语法"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            compile(f.read(), file_path, 'exec')
        return True
    except SyntaxError as e:
        print(f"❌ Python语法错误 {file_path}: {e}")
        return False
    except Exception as e:
        print(f"⚠️  检查Python文件时出错 {file_path}: {e}")
        return False

def check_json_syntax(file_path):
    """检查JSON文件语法"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True
    except json.JSONDecodeError as e:
        print(f"❌ JSON语法错误 {file_path}: {e}")
        return False
    except Exception as e:
        print(f"⚠️  检查JSON文件时出错 {file_path}: {e}")
        return False

def main():
    """主检查流程"""
    print("🔍 智剪蜂项目完整性检查")
    print("=" * 50)
    
    all_good = True
    
    # 检查核心文件
    print("\n📁 核心文件检查:")
    core_files = [
        ("README.md", "项目说明文件"),
        ("MVP_使用说明.md", "MVP使用说明"),
        ("install_env.sh", "环境安装脚本"),
        ("start_app.sh", "应用启动脚本"),
        ("stop_app.sh", "应用停止脚本"),
        ("test_mvp.py", "测试脚本"),
    ]
    
    for file_path, desc in core_files:
        if not check_file_exists(file_path, desc):
            all_good = False
    
    # 检查后端文件
    print("\n🐍 后端文件检查:")
    backend_files = [
        ("backend/main.py", "后端主程序"),
        ("backend/processor.py", "视频处理器"),
        ("backend/requirements.txt", "Python依赖文件"),
        ("backend/.env.example", "环境配置示例"),
    ]
    
    for file_path, desc in backend_files:
        if not check_file_exists(file_path, desc):
            all_good = False
    
    # 检查前端文件
    print("\n⚛️  前端文件检查:")
    frontend_files = [
        ("frontend/package.json", "Node.js依赖文件"),
        ("frontend/tsconfig.json", "TypeScript配置"),
        ("frontend/src/App.tsx", "前端主组件"),
        ("frontend/src/index.tsx", "前端入口文件"),
        ("frontend/src/App.css", "样式文件"),
        ("frontend/public/index.html", "HTML模板"),
    ]
    
    for file_path, desc in frontend_files:
        if not check_file_exists(file_path, desc):
            all_good = False
    
    # 检查AI引擎文件
    print("\n🤖 AI引擎文件检查:")
    ai_files = [
        ("ai_engine/core.py", "AI处理核心"),
    ]
    
    for file_path, desc in ai_files:
        if not check_file_exists(file_path, desc):
            all_good = False
    
    # 检查目录结构
    print("\n📂 目录结构检查:")
    directories = [
        ("backend", "后端目录"),
        ("frontend", "前端目录"),
        ("frontend/src", "前端源码目录"),
        ("frontend/public", "前端静态资源目录"),
        ("ai_engine", "AI引擎目录"),
    ]
    
    for dir_path, desc in directories:
        if not check_directory_exists(dir_path, desc):
            all_good = False
    
    # 检查Python文件语法
    print("\n🐍 Python语法检查:")
    python_files = [
        "backend/main.py",
        "backend/processor.py",
        "ai_engine/core.py",
        "test_mvp.py"
    ]
    
    for file_path in python_files:
        if os.path.exists(file_path):
            if check_python_syntax(file_path):
                print(f"✅ Python语法正确: {file_path}")
            else:
                all_good = False
        else:
            print(f"⚠️  跳过语法检查（文件不存在）: {file_path}")
    
    # 检查JSON文件语法
    print("\n📋 JSON语法检查:")
    json_files = [
        "frontend/package.json",
        "frontend/tsconfig.json"
    ]
    
    for file_path in json_files:
        if os.path.exists(file_path):
            if check_json_syntax(file_path):
                print(f"✅ JSON语法正确: {file_path}")
            else:
                all_good = False
        else:
            print(f"⚠️  跳过语法检查（文件不存在）: {file_path}")
    
    # 检查脚本执行权限
    print("\n🔐 脚本权限检查:")
    scripts = [
        "install_env.sh",
        "start_app.sh", 
        "stop_app.sh"
    ]
    
    for script in scripts:
        if os.path.exists(script):
            if os.access(script, os.X_OK):
                print(f"✅ 脚本可执行: {script}")
            else:
                print(f"⚠️  脚本不可执行: {script} (运行 chmod +x {script})")
        else:
            print(f"❌ 脚本不存在: {script}")
            all_good = False
    
    # 总结
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 项目完整性检查通过！")
        print("💡 下一步:")
        print("   1. 运行 ./install_env.sh 安装环境")
        print("   2. 运行 ./start_app.sh 启动应用")
        print("   3. 访问 http://localhost:3000 使用应用")
    else:
        print("❌ 项目完整性检查发现问题，请修复后重试")
        print("💡 建议:")
        print("   1. 检查缺失的文件和目录")
        print("   2. 修复语法错误")
        print("   3. 重新运行此检查脚本")
    
    return all_good

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)