"""
文件管理模块
用于存储和管理上传文件的元信息
"""

import json
import os
from pathlib import Path
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class FileManager:
    """文件信息管理器"""
    
    def __init__(self, metadata_dir: str = "metadata"):
        """初始化文件管理器"""
        self.metadata_dir = Path(metadata_dir)
        self.metadata_dir.mkdir(exist_ok=True)
        logger.info(f"文件管理器初始化完成，元数据目录: {self.metadata_dir}")
    
    def save_file_metadata(self, file_id: str, metadata: Dict) -> bool:
        """保存文件元数据"""
        try:
            metadata_file = self.metadata_dir / f"{file_id}.json"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            logger.info(f"文件元数据已保存: {file_id}")
            return True
        except Exception as e:
            logger.error(f"保存文件元数据失败: {file_id}, 错误: {str(e)}")
            return False
    
    def get_file_metadata(self, file_id: str) -> Optional[Dict]:
        """获取文件元数据"""
        try:
            metadata_file = self.metadata_dir / f"{file_id}.json"
            if not metadata_file.exists():
                return None
            
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            return metadata
        except Exception as e:
            logger.error(f"读取文件元数据失败: {file_id}, 错误: {str(e)}")
            return None
    
    def update_file_metadata(self, file_id: str, updates: Dict) -> bool:
        """更新文件元数据"""
        try:
            metadata = self.get_file_metadata(file_id)
            if metadata is None:
                metadata = {}
            
            metadata.update(updates)
            return self.save_file_metadata(file_id, metadata)
        except Exception as e:
            logger.error(f"更新文件元数据失败: {file_id}, 错误: {str(e)}")
            return False
    
    def delete_file_metadata(self, file_id: str) -> bool:
        """删除文件元数据"""
        try:
            metadata_file = self.metadata_dir / f"{file_id}.json"
            if metadata_file.exists():
                metadata_file.unlink()
                logger.info(f"文件元数据已删除: {file_id}")
            return True
        except Exception as e:
            logger.error(f"删除文件元数据失败: {file_id}, 错误: {str(e)}")
            return False

# 全局文件管理器实例
file_manager = FileManager()