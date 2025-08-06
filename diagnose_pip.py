#!/usr/bin/env python3
"""
智剪蜂 - pip问题诊断脚本
用于诊断和解决pip安装问题
"""

import subprocess
import sys
import os
import platform
from pathlib import Path

def run_command(cmd, capture_output=True):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=capture_output, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python_environment():
    """检查Python环境"""
    print("🐍 Python环境诊断:")
    print(f"   Python版本: {sys.version}")
    print(f"   Python路径: {sys.executable}")
    print(f"   操作系统: {platform.system()} {platform.release()}")
    print(f"   架构: {platform.machine()}")
    
    # 检查pip版本
    success, stdout, stderr = run_command("pip --version")
    if success:
        print(f"   pip版本: {stdout.strip()}")
    else:
        print(f"   ❌ pip不可用: {stderr}")
        return False
    
    return True

def check_network_connectivity():
    """检查网络连接"""
    print("\n🌐 网络连接诊断:")
    
    test_urls = [
        "https://pypi.org/simple/",
        "https://pypi.tuna.tsinghua.edu.cn/simple/",
        "https://mirrors.aliyun.com/pypi/simple/",
    ]
    
    for url in test_urls:
        success, _, _ = run_command(f"curl -s --connect-timeout 5 {url} > /dev/null")
        status = "✅ 可访问" if success else "❌ 不可访问"
        print(f"   {url}: {status}")

def check_disk_space():
    """检查磁盘空间"""
    print("\n💾 磁盘空间检查:")
    
    # 检查当前目录空间
    success, stdout, _ = run_command("df -h .")
    if success:
        lines = stdout.strip().split('\n')
        if len(lines) > 1:
            print(f"   当前目录: {lines[1]}")
    
    # 检查临时目录空间
    import tempfile
    temp_dir = tempfile.gettempdir()
    success, stdout, _ = run_command(f"df -h {temp_dir}")
    if success:
        lines = stdout.strip().split('\n')
        if len(lines) > 1:
            print(f"   临时目录: {lines[1]}")

def check_permissions():
    """检查权限"""
    print("\n🔐 权限检查:")
    
    # 检查当前目录写权限
    current_dir = Path(".")
    if os.access(current_dir, os.W_OK):
        print("   ✅ 当前目录可写")
    else:
        print("   ❌ 当前目录不可写")
    
    # 检查Python site-packages权限
    import site
    for site_dir in site.getsitepackages():
        if os.path.exists(site_dir):
            if os.access(site_dir, os.W_OK):
                print(f"   ✅ {site_dir} 可写")
            else:
                print(f"   ❌ {site_dir} 不可写")
            break

def test_pip_install():
    """测试pip安装功能"""
    print("\n🧪 pip安装测试:")
    
    # 测试安装一个小包
    test_package = "six"  # 一个很小的包
    
    print(f"   测试安装 {test_package}...")
    success, stdout, stderr = run_command(f"pip install --no-cache-dir --dry-run {test_package}")
    
    if success:
        print("   ✅ pip安装功能正常")
        return True
    else:
        print(f"   ❌ pip安装测试失败: {stderr}")
        return False

def suggest_solutions():
    """提供解决方案建议"""
    print("\n💡 解决方案建议:")
    
    print("1. 升级pip:")
    print("   python3 -m pip install --upgrade pip")
    
    print("\n2. 清理pip缓存:")
    print("   pip cache purge")
    
    print("\n3. 使用国内镜像源:")
    print("   pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple")
    
    print("\n4. 使用用户安装模式:")
    print("   pip install --user package_name")
    
    print("\n5. 使用虚拟环境:")
    print("   python3 -m venv venv")
    print("   source venv/bin/activate")
    
    print("\n6. 手动下载安装:")
    print("   下载.whl文件后使用: pip install package.whl")

def fix_common_issues():
    """修复常见问题"""
    print("\n🔧 自动修复常见问题:")
    
    # 1. 升级pip
    print("1. 升级pip...")
    success, _, _ = run_command("python3 -m pip install --upgrade pip")
    if success:
        print("   ✅ pip升级成功")
    else:
        print("   ❌ pip升级失败")
    
    # 2. 清理缓存
    print("2. 清理pip缓存...")
    success, _, _ = run_command("pip cache purge")
    if success:
        print("   ✅ 缓存清理成功")
    else:
        print("   ⚠️  缓存清理失败或不支持")
    
    # 3. 配置镜像源
    print("3. 配置国内镜像源...")
    success, _, _ = run_command("pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple")
    if success:
        print("   ✅ 镜像源配置成功")
    else:
        print("   ❌ 镜像源配置失败")
    
    # 4. 测试安装
    print("4. 测试安装功能...")
    if test_pip_install():
        print("   ✅ 修复成功，pip功能正常")
        return True
    else:
        print("   ❌ 修复后仍有问题")
        return False

def main():
    """主诊断流程"""
    print("🔍 智剪蜂 pip问题诊断工具")
    print("=" * 50)
    
    # 基础环境检查
    if not check_python_environment():
        print("\n❌ Python环境有问题，请先解决Python安装问题")
        return False
    
    # 网络连接检查
    check_network_connectivity()
    
    # 磁盘空间检查
    check_disk_space()
    
    # 权限检查
    check_permissions()
    
    # pip功能测试
    if test_pip_install():
        print("\n🎉 pip功能正常，可以正常安装依赖！")
        return True
    
    # 尝试自动修复
    print("\n🔧 检测到pip问题，尝试自动修复...")
    if fix_common_issues():
        print("\n🎉 问题已修复！")
        return True
    
    # 提供手动解决方案
    suggest_solutions()
    
    print("\n📞 如果问题仍然存在，请:")
    print("   1. 检查防火墙和代理设置")
    print("   2. 尝试使用系统包管理器安装Python包")
    print("   3. 考虑使用Docker环境")
    
    return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)