"""
智剪蜂 AI 处理核心模块
包含语音识别、语义分析和视频剪辑的核心功能
"""

import whisper
import torch
import ffmpeg
import os
import json
from pathlib import Path
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class VocalCutEngine:
    """智剪蜂核心处理引擎"""
    
    def __init__(self):
        """初始化AI引擎"""
        self.whisper_model = None
        self.load_models()
    
    def load_models(self):
        """加载AI模型"""
        try:
            # 检查环境变量配置
            whisper_model_name = os.getenv("WHISPER_MODEL", "base")
            use_gpu = os.getenv("USE_GPU", "false").lower() == "true"
            
            logger.info(f"正在加载Whisper模型: {whisper_model_name}")
            logger.info(f"GPU使用: {'启用' if use_gpu else '禁用'}")
            
            # 加载Whisper语音识别模型
            device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
            self.whisper_model = whisper.load_model(whisper_model_name, device=device)
            
            logger.info(f"Whisper模型加载完成 (设备: {device})")
            
            # 加载中文分词器
            try:
                import jieba
                jieba.initialize()
                logger.info("中文分词器初始化完成")
            except ImportError:
                logger.warning("jieba未安装，中文处理功能受限")
                
        except Exception as e:
            logger.error(f"模型加载失败: {str(e)}")
            raise
    
    def transcribe_audio(self, video_path: str) -> Dict:
        """
        语音识别：将视频中的语音转换为带时间戳的文本
        
        Args:
            video_path: 视频文件路径
            
        Returns:
            包含转录结果的字典
        """
        try:
            logger.info(f"开始语音识别: {video_path}")
            
            # 使用Whisper进行语音识别
            result = self.whisper_model.transcribe(
                video_path,
                language="zh",  # 中文
                word_timestamps=True,  # 获取词级时间戳
                verbose=False
            )
            
            # 处理识别结果
            segments = []
            for segment in result["segments"]:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"].strip(),
                    "confidence": segment.get("avg_logprob", 0)
                })
            
            logger.info(f"语音识别完成，共识别到 {len(segments)} 个片段")
            
            return {
                "text": result["text"],
                "segments": segments,
                "language": result["language"]
            }
            
        except Exception as e:
            logger.error(f"语音识别失败: {str(e)}")
            raise
    
    def analyze_content(self, transcription: Dict) -> Dict:
        """
        语义分析：识别核心内容和冗余部分
        
        Args:
            transcription: 语音识别结果
            
        Returns:
            分析结果，包含核心片段和冗余片段
        """
        try:
            logger.info("开始语义分析...")
            
            segments = transcription["segments"]
            analyzed_segments = []
            
            # 简单的规则基础分析（MVP版本）
            for segment in segments:
                text = segment["text"]
                
                # 判断是否为冗余内容
                is_redundant = self._is_redundant_content(text)
                
                # 计算重要性得分
                importance_score = self._calculate_importance_score(text)
                
                analyzed_segments.append({
                    **segment,
                    "is_redundant": is_redundant,
                    "importance_score": importance_score,
                    "content_type": self._classify_content_type(text)
                })
            
            logger.info("语义分析完成")
            
            return {
                "segments": analyzed_segments,
                "total_segments": len(analyzed_segments),
                "redundant_count": sum(1 for s in analyzed_segments if s["is_redundant"])
            }
            
        except Exception as e:
            logger.error(f"语义分析失败: {str(e)}")
            raise
    
    def _is_redundant_content(self, text: str) -> bool:
        """判断是否为冗余内容"""
        redundant_patterns = [
            "呃", "嗯", "那个", "这个", "就是说", "然后呢", 
            "好的", "OK", "对吧", "是不是", "怎么说呢"
        ]
        
        # 检查是否包含冗余词汇
        for pattern in redundant_patterns:
            if pattern in text:
                return True
        
        # 检查是否为重复内容（简单版本）
        if len(text.strip()) < 5:
            return True
            
        return False
    
    def _calculate_importance_score(self, text: str) -> float:
        """计算内容重要性得分"""
        score = 0.5  # 基础分数
        
        # 关键词加分
        important_keywords = [
            "重要", "关键", "核心", "总结", "结论", "数据", 
            "案例", "例子", "方法", "技巧", "注意"
        ]
        
        for keyword in important_keywords:
            if keyword in text:
                score += 0.2
        
        # 长度加分（适中长度更重要）
        text_length = len(text.strip())
        if 10 <= text_length <= 100:
            score += 0.1
        
        return min(score, 1.0)  # 最高1.0分
    
    def _classify_content_type(self, text: str) -> str:
        """分类内容类型"""
        if any(word in text for word in ["数据", "百分比", "%", "数字"]):
            return "data"
        elif any(word in text for word in ["案例", "例子", "比如", "举例"]):
            return "example"
        elif any(word in text for word in ["总结", "结论", "最后", "综上"]):
            return "conclusion"
        elif any(word in text for word in ["重要", "关键", "核心"]):
            return "key_point"
        else:
            return "general"
    
    def generate_cut_plan(self, analysis: Dict, target_duration: int) -> List[Dict]:
        """
        生成剪辑方案
        
        Args:
            analysis: 语义分析结果
            target_duration: 目标时长（秒）
            
        Returns:
            剪辑方案列表
        """
        try:
            logger.info(f"生成剪辑方案，目标时长: {target_duration}秒")
            
            segments = analysis["segments"]
            
            # 过滤掉冗余内容
            important_segments = [
                s for s in segments 
                if not s["is_redundant"] and s["importance_score"] > 0.3
            ]
            
            # 按重要性排序
            important_segments.sort(key=lambda x: x["importance_score"], reverse=True)
            
            # 选择片段直到达到目标时长
            selected_segments = []
            total_duration = 0
            
            for segment in important_segments:
                segment_duration = segment["end"] - segment["start"]
                if total_duration + segment_duration <= target_duration:
                    selected_segments.append(segment)
                    total_duration += segment_duration
                else:
                    break
            
            # 按时间顺序重新排列
            selected_segments.sort(key=lambda x: x["start"])
            
            logger.info(f"剪辑方案生成完成，选择了 {len(selected_segments)} 个片段")
            
            return selected_segments
            
        except Exception as e:
            logger.error(f"生成剪辑方案失败: {str(e)}")
            raise
    
    def cut_video(self, input_path: str, output_path: str, cut_plan: List[Dict]) -> str:
        """
        执行视频剪辑
        
        Args:
            input_path: 输入视频路径
            output_path: 输出视频路径
            cut_plan: 剪辑方案
            
        Returns:
            输出文件路径
        """
        try:
            logger.info(f"开始剪辑视频: {input_path}")
            
            if not cut_plan:
                raise ValueError("剪辑方案为空")
            
            # 创建临时片段文件列表
            temp_files = []
            
            for i, segment in enumerate(cut_plan):
                temp_file = f"temp_segment_{i}.mp4"
                temp_files.append(temp_file)
                
                # 剪切单个片段，使用更高的压缩率
                (
                    ffmpeg
                    .input(input_path, ss=segment["start"], t=segment["end"] - segment["start"])
                    .output(temp_file, vcodec='libx264', acodec='aac', 
                            video_bitrate='1000k', audio_bitrate='128k',
                            preset='medium', crf=23)
                    .overwrite_output()
                    .run(quiet=True)
                )
            
            # 合并所有片段
            if len(temp_files) == 1:
                # 只有一个片段，直接重命名
                os.rename(temp_files[0], output_path)
            else:
                # 多个片段需要合并
                # 创建一个concat文件列表
                concat_file = "concat_list.txt"
                with open(concat_file, "w") as f:
                    for temp_file in temp_files:
                        f.write(f"file '{temp_file}'\n")
                
                # 使用concat demuxer并添加优化的编码参数
                (
                    ffmpeg
                    .input(concat_file, format='concat', safe=0)
                    .output(output_path, vcodec='libx264', acodec='aac',
                            video_bitrate='1500k', audio_bitrate='128k',
                            preset='medium', crf=23)
                    .overwrite_output()
                    .run(quiet=True)
                )
                
                # 删除concat文件
                if os.path.exists(concat_file):
                    os.remove(concat_file)
                
                # 清理临时文件
                for temp_file in temp_files:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
            
            logger.info(f"视频剪辑完成: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"视频剪辑失败: {str(e)}")
            # 清理临时文件
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            raise
    
    def process_video(self, input_path: str, output_path: str, target_duration: int = 300) -> Dict:
        """
        完整的视频处理流程
        
        Args:
            input_path: 输入视频路径
            output_path: 输出视频路径
            target_duration: 目标时长（秒），默认5分钟
            
        Returns:
            处理结果
        """
        try:
            logger.info(f"开始处理视频: {input_path}")
            
            # 1. 语音识别
            transcription = self.transcribe_audio(input_path)
            
            # 2. 语义分析
            analysis = self.analyze_content(transcription)
            
            # 3. 生成剪辑方案
            cut_plan = self.generate_cut_plan(analysis, target_duration)
            
            # 4. 执行剪辑
            result_path = self.cut_video(input_path, output_path, cut_plan)
            
            # 5. 返回处理结果
            result = {
                "success": True,
                "input_path": input_path,
                "output_path": result_path,
                "original_text": transcription["text"],
                "segments_total": analysis["total_segments"],
                "segments_selected": len(cut_plan),
                "redundant_removed": analysis["redundant_count"],
                "target_duration": target_duration,
                "processing_summary": {
                    "语音识别": "完成",
                    "语义分析": "完成", 
                    "智能剪辑": "完成"
                }
            }
            
            logger.info("视频处理完成")
            return result
            
        except Exception as e:
            logger.error(f"视频处理失败: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "input_path": input_path
            }