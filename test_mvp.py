#!/usr/bin/env python3
"""
智剪蜂 MVP 测试脚本
用于验证基本功能是否正常工作
"""

import requests
import time
import os
from pathlib import Path

# 配置
API_BASE = "http://localhost:8000"
TEST_VIDEO_PATH = "test_video.mp4"  # 需要用户提供测试视频

def test_health_check():
    """测试健康检查接口"""
    print("🔍 测试健康检查接口...")
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ 健康检查通过")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {str(e)}")
        return False

def test_upload_video():
    """测试视频上传"""
    print("📤 测试视频上传...")
    
    if not os.path.exists(TEST_VIDEO_PATH):
        print(f"❌ 测试视频文件不存在: {TEST_VIDEO_PATH}")
        print("请将测试视频文件命名为 test_video.mp4 并放在当前目录")
        return None
    
    try:
        with open(TEST_VIDEO_PATH, 'rb') as f:
            files = {'file': (TEST_VIDEO_PATH, f, 'video/mp4')}
            response = requests.post(f"{API_BASE}/api/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                file_id = data.get('file_id')
                print(f"✅ 视频上传成功, file_id: {file_id}")
                return file_id
            else:
                print(f"❌ 上传失败: {data}")
                return None
        else:
            print(f"❌ 上传请求失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 上传异常: {str(e)}")
        return None

def test_process_video(file_id):
    """测试视频处理"""
    print("🤖 测试视频处理...")
    
    try:
        payload = {
            "file_id": file_id,
            "target_duration": 60  # 1分钟测试
        }
        response = requests.post(f"{API_BASE}/api/process", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ 视频处理请求成功")
                return True
            else:
                print(f"❌ 处理失败: {data}")
                return False
        else:
            print(f"❌ 处理请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 处理异常: {str(e)}")
        return False

def test_status_check(file_id):
    """测试状态查询"""
    print("📊 测试状态查询...")
    
    try:
        response = requests.get(f"{API_BASE}/api/status/{file_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 状态查询成功: {data.get('status')} - {data.get('message')}")
            return data
        else:
            print(f"❌ 状态查询失败: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 状态查询异常: {str(e)}")
        return None

def test_download(file_id):
    """测试文件下载"""
    print("📥 测试文件下载...")
    
    try:
        response = requests.get(f"{API_BASE}/api/download/{file_id}")
        
        if response.status_code == 200:
            output_file = f"output_{file_id}.mp4"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"✅ 文件下载成功: {output_file}")
            return True
        else:
            print(f"❌ 文件下载失败: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 下载异常: {str(e)}")
        return False

def main():
    """主测试流程"""
    print("🚀 开始智剪蜂 MVP 功能测试")
    print("=" * 50)
    
    # 1. 健康检查
    if not test_health_check():
        print("❌ 服务未启动或不可用，请先运行 ./start_mvp.sh")
        return
    
    print()
    
    # 2. 上传视频
    file_id = test_upload_video()
    if not file_id:
        return
    
    print()
    
    # 3. 处理视频
    if not test_process_video(file_id):
        return
    
    print()
    
    # 4. 等待处理完成
    print("⏳ 等待处理完成...")
    max_wait = 60  # 最多等待60秒
    wait_time = 0
    
    while wait_time < max_wait:
        time.sleep(5)
        wait_time += 5
        
        status_data = test_status_check(file_id)
        if status_data and status_data.get('status') == 'completed':
            print("✅ 处理完成!")
            break
        elif status_data and status_data.get('status') == 'failed':
            print("❌ 处理失败!")
            return
        else:
            print(f"⏳ 处理中... ({wait_time}s)")
    
    if wait_time >= max_wait:
        print("⏰ 等待超时")
        return
    
    print()
    
    # 5. 下载结果
    test_download(file_id)
    
    print()
    print("🎉 MVP 功能测试完成!")
    print("=" * 50)

if __name__ == "__main__":
    main()