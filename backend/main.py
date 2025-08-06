from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os
import uuid
from pathlib import Path
import logging
from datetime import datetime
from processor import processor
from file_manager import FileManager

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化文件管理器
file_manager = FileManager()

# 请求模型
class ProcessRequest(BaseModel):
    file_id: str
    target_duration: int = 300

app = FastAPI(
    title="智剪蜂 API",
    description="口播智能剪辑应用后端服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建必要的目录
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    """健康检查接口"""
    return {"message": "智剪蜂 API 服务正常运行", "version": "1.0.0"}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    上传视频文件接口
    """
    try:
        # 验证文件类型
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="请上传视频文件")
        
        # 验证文件大小 (最大2GB)
        if file.size > 2 * 1024 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="文件大小不能超过2GB")
        
        # 生成唯一文件名
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        filename = f"{file_id}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 保存文件元数据
        metadata = {
            "file_id": file_id,
            "original_filename": file.filename,
            "saved_filename": filename,
            "file_size": file.size,
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat(),
            "file_path": str(file_path)
        }
        file_manager.save_file_metadata(file_id, metadata)
        
        logger.info(f"文件上传成功: {filename}")
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "original_filename": file.filename,
            "message": "文件上传成功"
        }
        
    except Exception as e:
        logger.error(f"文件上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@app.post("/api/process")
async def process_video(request: ProcessRequest):
    """
    处理视频接口 - 集成AI引擎
    """
    try:
        file_id = request.file_id
        target_duration = request.target_duration
        
        logger.info(f"开始处理视频: {file_id}, 目标时长: {target_duration}秒")
        
        # 记录开始时间
        import time
        start_time = time.time()
        
        # 获取原始文件大小
        input_path = processor.get_input_file_path(file_id)
        original_size = input_path.stat().st_size if input_path and input_path.exists() else 0
        
        # 使用处理器异步处理视频
        result = await processor.process_video_async(file_id, target_duration)
        
        # 计算处理时间
        processing_time = time.time() - start_time
        
        if result["success"]:
            # 获取处理后文件大小
            output_path = processor.get_output_file_path(file_id)
            processed_size = output_path.stat().st_size if output_path.exists() else 0
            
            # 格式化文件大小
            def format_file_size(size_bytes):
                if size_bytes == 0:
                    return "0 B"
                size_names = ["B", "KB", "MB", "GB"]
                import math
                i = int(math.floor(math.log(size_bytes, 1024)))
                p = math.pow(1024, i)
                s = round(size_bytes / p, 2)
                return f"{s} {size_names[i]}"
            
            # 计算压缩比例
            compression_ratio = 0
            if original_size > 0:
                compression_ratio = ((original_size - processed_size) / original_size) * 100
            
            # 格式化处理时间
            def format_processing_time(seconds):
                if seconds < 60:
                    return f"{seconds:.1f}秒"
                elif seconds < 3600:
                    minutes = int(seconds // 60)
                    remaining_seconds = seconds % 60
                    return f"{minutes}分{remaining_seconds:.1f}秒"
                else:
                    hours = int(seconds // 3600)
                    minutes = int((seconds % 3600) // 60)
                    return f"{hours}小时{minutes}分钟"
            
            # 添加处理统计信息
            result["processing_stats"] = {
                "processing_time": processing_time,
                "processing_time_formatted": format_processing_time(processing_time),
                "original_size": original_size,
                "processed_size": processed_size,
                "original_size_formatted": format_file_size(original_size),
                "processed_size_formatted": format_file_size(processed_size),
                "compression_ratio": compression_ratio,
                "size_reduction": original_size - processed_size
            }
            
            return {
                "success": True,
                "file_id": file_id,
                "status": "completed",
                "message": "视频处理完成",
                "result": result
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "处理失败"))
        
    except Exception as e:
        logger.error(f"视频处理失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"视频处理失败: {str(e)}")

@app.get("/api/status/{file_id}")
async def get_processing_status(file_id: str):
    """
    查询处理状态接口
    """
    try:
        # 获取文件信息
        file_info = processor.get_file_info(file_id)
        if not file_info:
            raise HTTPException(status_code=404, detail="找不到指定的文件")
        
        # 判断处理状态
        if file_info["output_exists"]:
            status = "completed"
            progress = 100
            message = "处理完成"
        elif file_info["input_exists"]:
            status = "ready"
            progress = 0
            message = "等待处理"
        else:
            status = "not_found"
            progress = 0
            message = "文件不存在"
        
        return {
            "file_id": file_id,
            "status": status,
            "progress": progress,
            "message": message,
            "output_url": f"/api/download/{file_id}" if status == "completed" else None,
            "file_info": file_info
        }
    except Exception as e:
        logger.error(f"查询状态失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询状态失败: {str(e)}")

@app.get("/api/download/{file_id}")
async def download_processed_video(file_id: str):
    """
    下载处理后的视频文件
    """
    try:
        output_path = processor.get_output_file_path(file_id)
        
        if not output_path.exists():
            raise HTTPException(status_code=404, detail="处理后的文件不存在")
        
        # 获取原始文件名
        original_filename = "智剪蜂_剪辑结果.mp4"
        try:
            # 从文件管理器获取元数据
            metadata = file_manager.get_file_metadata(file_id)
            if metadata and metadata.get("original_filename"):
                original_name = Path(metadata["original_filename"]).stem
                original_filename = f"{original_name}_剪辑版.mp4"
        except Exception as e:
            logger.warning(f"获取原始文件名失败: {e}")
        
        # 处理文件名编码，确保中文文件名可以正确下载
        import urllib.parse
        encoded_filename = urllib.parse.quote(original_filename)
        
        return FileResponse(
            path=str(output_path),
            filename=original_filename,
            media_type="video/mp4",
            headers={
                "Content-Disposition": f"attachment; filename=\"{encoded_filename}\"; filename*=UTF-8''{encoded_filename}",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        )
        
    except Exception as e:
        logger.error(f"下载文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"下载文件失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)