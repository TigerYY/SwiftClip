# API Error Handling Specification

## ADDED Requirements

### Requirement: Unified Error Response Format

系统SHALL实现统一的错误响应格式，所有API端点MUST返回一致的错误信息结构，确保前端能够一致地处理错误。

#### Scenario: API返回验证错误
- **Given**: 用户上传了不支持的文件类型
- **When**: 调用`/api/upload`端点
- **Then**: 系统MUST返回400状态码和标准化错误响应
- **Response Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_FILE_TYPE",
      "message": "不支持的文件类型",
      "details": {
        "allowedTypes": ["video/mp4", "video/webm", "video/quicktime"],
        "receivedType": "image/jpeg"
      }
    },
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_123456"
  }
  ```

#### Scenario: API返回系统错误
- **Given**: 视频处理过程中FFmpeg执行失败
- **When**: 调用`/api/process`端点
- **Then**: 系统MUST返回500状态码和标准化错误响应
- **Response Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "PROCESSING_FAILED",
      "message": "视频处理失败",
      "details": {
        "stage": "compression",
        "reason": "FFmpeg execution failed"
      }
    },
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_123457"
  }
  ```

### Requirement: Error Classification System

系统SHALL建立错误分类系统，为不同类型的错误分配适当的HTTP状态码和错误代码。

#### Scenario: 输入验证错误处理
- **Given**: 客户端发送无效的请求参数
- **When**: API端点接收到请求
- **Then**: 系统MUST返回400状态码和`VALIDATION_ERROR`类型错误
- **Error Codes**:
  - `INVALID_FILE_TYPE`: 不支持的文件类型
  - `FILE_TOO_LARGE`: 文件大小超出限制
  - `MISSING_REQUIRED_FIELD`: 缺少必需字段

#### Scenario: 资源不存在错误处理
- **Given**: 客户端请求不存在的文件
- **When**: 调用`/api/video/{filename}`端点
- **Then**: 系统MUST返回404状态码和`NOT_FOUND_ERROR`类型错误
- **Error Codes**:
  - `FILE_NOT_FOUND`: 请求的文件不存在
  - `RESOURCE_NOT_FOUND`: 请求的资源不存在

#### Scenario: 业务逻辑错误处理
- **Given**: 系统无法处理特定的业务请求
- **When**: 执行业务逻辑时遇到问题
- **Then**: 系统MUST返回422状态码和`BUSINESS_ERROR`类型错误
- **Error Codes**:
  - `PROCESSING_FAILED`: 视频处理失败
  - `INSUFFICIENT_STORAGE`: 存储空间不足
  - `CONCURRENT_PROCESSING`: 并发处理限制

### Requirement: Error Logging and Monitoring

系统SHALL实现结构化错误日志记录，支持错误监控和分析。

#### Scenario: 错误日志记录
- **Given**: API端点发生任何错误
- **When**: 错误被捕获和处理
- **Then**: 系统MUST记录结构化错误日志
- **Log Format**:
  ```json
  {
    "timestamp": "2024-12-20T10:30:00Z",
    "level": "ERROR",
    "message": "API request failed",
    "context": {
      "requestId": "req_123456",
      "endpoint": "/api/upload",
      "method": "POST",
      "statusCode": 400,
      "errorCode": "INVALID_FILE_TYPE",
      "userId": "user_123",
      "duration": 150
    },
    "error": {
      "message": "不支持的文件类型",
      "stack": "Error stack trace...",
      "details": {...}
    }
  }
  ```

#### Scenario: 错误统计和监控
- **Given**: 系统运行过程中发生各种错误
- **When**: 错误被记录到日志系统
- **Then**: 系统MUST提供错误统计和监控数据
- **Metrics**:
  - 错误率按端点统计
  - 错误类型分布
  - 错误趋势分析
  - 响应时间统计

## MODIFIED Requirements

### Requirement: Enhanced Input Validation

现有API端点的输入验证SHALL被加强，提供更详细的验证错误信息。

#### Scenario: 文件上传验证增强
- **Given**: 现有的文件上传验证逻辑
- **When**: 用户上传文件时
- **Then**: 系统MUST提供更详细的验证错误信息
- **Changes**:
  - 添加文件内容类型检测（不仅依赖MIME类型）
  - 提供具体的文件大小限制信息
  - 验证文件名安全性

#### Scenario: 处理参数验证增强
- **Given**: 现有的处理参数验证
- **When**: 调用视频处理API时
- **Then**: 系统MUST验证所有处理参数的有效性
- **Changes**:
  - 验证目标时长范围（30秒-3600秒）
  - 验证文件名格式和安全性
  - 添加可选参数的默认值处理

### Requirement: Improved Error Recovery

错误恢复机制SHALL被改进，确保系统在错误后能够正确清理资源。

#### Scenario: 处理失败后的资源清理
- **Given**: 视频处理过程中发生错误
- **When**: 错误被捕获
- **Then**: 系统MUST自动清理所有相关临时文件和资源
- **Recovery Actions**:
  - 删除临时音频文件
  - 清理未完成的输出文件
  - 释放处理队列中的任务
  - 记录清理操作结果