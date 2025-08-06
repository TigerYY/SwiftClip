"""
视频处理服务模块
集成AI引擎，提供完整的视频处理功能
"""

import os
import sys
from pathlib import Path
import logging
from typing import Dict, Optional
import asyncio
import shutil

# 添加ai_engine到Python路径
sys.path.append(str(Path(__file__).parent.parent / "ai_engine"))

logger = logging.getLogger(__name__)

try:
    from core import VocalCutEngine
    AI_ENGINE_AVAILABLE = True
except ImportError:
    logger.warning("AI引擎模块未找到，使用模拟模式")
    AI_ENGINE_AVAILABLE = False
    
    # 创建模拟AI引擎用于开发测试
    class VocalCutEngine:
        def __init__(self):
            logger.info("使用模拟AI引擎")
        
        def process_video(self, input_path: str, output_path: str, target_duration: int = 300) -> Dict:
            """模拟视频处理"""
            try:
                # 模拟处理延时
                import time
                time.sleep(2)
                
                # 简单复制文件作为模拟输出
                if os.path.exists(input_path):
                    shutil.copy2(input_path, output_path)
                
                return {
                    "success": True,
                    "input_path": input_path,
                    "output_path": output_path,
                    "original_text": "这是一个模拟的转录文本，包含了视频中的主要内容。在实际应用中，这里会显示AI识别出的完整语音内容。",
                    "segments_total": 25,
                    "segments_selected": 12,
                    "redundant_removed": 8,
                    "target_duration": target_duration,
                    "processing_summary": {
                        "语音识别": "完成（模拟）",
                        "语义分析": "完成（模拟）", 
                        "智能剪辑": "完成（模拟）"
                    }
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"模拟处理失败: {str(e)}",
                    "input_path": input_path
                }

class VideoProcessor:
    """视频处理器"""
    
    def __init__(self):
        """初始化处理器"""
        self.engine = VocalCutEngine()
        self.upload_dir = Path("uploads")
        self.output_dir = Path("outputs")
        
        # 确保目录存在
        self.upload_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
        logger.info(f"视频处理器初始化完成，AI引擎可用: {AI_ENGINE_AVAILABLE}")
    
    def get_input_file_path(self, file_id: str) -> Optional[Path]:
        """获取输入文件路径"""
        # 查找匹配的文件
        matching_files = list(self.upload_dir.glob(f"{file_id}.*"))
        if matching_files:
            return matching_files[0]
        return None
    
    def get_output_file_path(self, file_id: str) -> Path:
        """生成输出文件路径"""
        return self.output_dir / f"{file_id}_processed.mp4"
    
    async def process_video_async(self, file_id: str, target_duration: int = 300) -> Dict:
        """异步处理视频"""
        try:
            # 获取输入文件路径
            input_path = self.get_input_file_path(file_id)
            if not input_path or not input_path.exists():
                raise FileNotFoundError(f"找不到文件: {file_id}")
            
            # 生成输出文件路径
            output_path = self.get_output_file_path(file_id)
            
            logger.info(f"开始处理视频: {input_path} -> {output_path}")
            
            # 在线程池中运行AI处理（避免阻塞事件循环）
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self.engine.process_video,
                str(input_path),
                str(output_path),
                target_duration
            )
            
            if result["success"]:
                logger.info(f"视频处理完成: {file_id}")
            else:
                logger.error(f"视频处理失败: {file_id}, 错误: {result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"处理视频时发生异常: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "file_id": file_id
            }
    
    def process_video_sync(self, file_id: str, target_duration: int = 300) -> Dict:
        """同步处理视频（用于非异步环境）"""
        try:
            # 获取输入文件路径
            input_path = self.get_input_file_path(file_id)
            if not input_path or not input_path.exists():
                raise FileNotFoundError(f"找不到文件: {file_id}")
            
            # 生成输出文件路径
            output_path = self.get_output_file_path(file_id)
            
            logger.info(f"开始处理视频: {input_path} -> {output_path}")
            
            # 调用AI引擎处理
            result = self.engine.process_video(
                str(input_path),
                str(output_path),
                target_duration
            )
            
            if result["success"]:
                logger.info(f"视频处理完成: {file_id}")
            else:
                logger.error(f"视频处理失败: {file_id}, 错误: {result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"处理视频时发生异常: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "file_id": file_id
            }
    
    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """获取文件信息"""
        input_path = self.get_input_file_path(file_id)
        output_path = self.get_output_file_path(file_id)
        
        if not input_path:
            return None
        
        # 获取原始文件名
        original_filename = input_path.name if input_path else None
        
        return {
            "file_id": file_id,
            "input_path": str(input_path),
            "output_path": str(output_path),
            "input_exists": input_path.exists(),
            "output_exists": output_path.exists(),
            "input_size": input_path.stat().st_size if input_path.exists() else 0,
            "output_size": output_path.stat().st_size if output_path.exists() else 0,
            "original_filename": original_filename
        }
    
    def cleanup_files(self, file_id: str, keep_output: bool = True):
        """清理文件"""
        try:
            # 清理输入文件
            input_path = self.get_input_file_path(file_id)
            if input_path and input_path.exists():
                input_path.unlink()
                logger.info(f"已删除输入文件: {input_path}")
            
            # 根据参数决定是否清理输出文件
            if not keep_output:
                output_path = self.get_output_file_path(file_id)
                if output_path.exists():
                    output_path.unlink()
                    logger.info(f"已删除输出文件: {output_path}")
                    
        except Exception as e:
            logger.error(f"清理文件失败: {str(e)}")

# 全局处理器实例
processor = VideoProcessor()