# 贡献指南

感谢您对智剪蜂项目的关注！我们欢迎各种形式的贡献，包括但不限于功能请求、bug报告、代码贡献、文档改进等。

## 如何贡献

### 报告Bug

如果您发现了bug，请通过GitHub Issues提交报告，并尽可能详细地描述：

1. 问题的具体表现
2. 复现步骤
3. 预期行为
4. 截图（如适用）
5. 运行环境（操作系统、浏览器等）

### 提出新功能

如果您有新功能的想法，请先通过Issues讨论，说明：

1. 功能的具体描述
2. 为什么这个功能对项目有价值
3. 您对实现方式的初步构想（如有）

### 提交代码

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加某某功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码风格

- **Python代码**：遵循PEP 8规范
- **JavaScript/TypeScript**：使用ESLint和Prettier格式化
- **提交信息**：简洁明了，说明更改内容

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/smart-video-cutter.git
cd smart-video-cutter
```

2. 安装开发依赖
```bash
# 后端依赖
cd backend
pip install -r requirements-dev.txt
cd ..

# 前端依赖
cd frontend
npm install
cd ..
```

3. 运行测试
```bash
# 后端测试
python -m pytest backend/tests

# 前端测试
cd frontend
npm test
```

## 分支策略

- `main`: 稳定版本分支
- `dev`: 开发分支，所有功能开发都基于此分支
- `feature/*`: 新功能分支
- `bugfix/*`: 错误修复分支
- `release/*`: 发布准备分支

## 发布流程

1. 从`dev`分支创建`release/vX.Y.Z`分支
2. 在release分支上进行最终测试和修复
3. 合并到`main`分支并打标签
4. 将发布更改合并回`dev`分支

## 行为准则

- 尊重所有贡献者
- 建设性地提出意见和建议
- 专注于项目改进而非个人批评
- 欢迎新人参与，耐心解答问题

## 许可证

通过贡献代码，您同意您的贡献将在项目的MIT许可证下发布。