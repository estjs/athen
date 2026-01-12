# 贡献指南

感谢您对本项目的贡献兴趣！本指南将帮助您开始贡献。

## 贡献方式

### 📝 文档
- 修复拼写错误并提高清晰度
- 添加示例和教程
- 将内容翻译成其他语言
- 改进 API 文档

### 🐛 错误报告
- 报告您遇到的问题
- 提供详细的重现步骤
- 包含环境信息

### 💡 功能请求
- 建议新功能或改进
- 讨论实现方法
- 帮助确定开发优先级

### 🔧 代码贡献
- 修复错误并实现功能
- 改进性能和可访问性
- 添加测试和文档

## 开始贡献

### 前置要求
- Node.js 18 或更高版本
- npm、yarn 或 pnpm
- Git

### 设置开发环境

1. **Fork 并克隆仓库：**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **安装依赖：**
   ```bash
   npm install
   ```

3. **启动开发服务器：**
   ```bash
   npm run dev
   ```

4. **进行更改** 并在本地测试

5. **构建和测试：**
   ```bash
   npm run build
   npm run preview
   ```

## 贡献工作流

### 1. 创建 Issue
开始工作前，创建一个 issue 来讨论：
- 您想要更改什么
- 为什么需要这个更改
- 您计划如何实现

### 2. 创建分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-number
```

### 3. 进行更改
- 遵循现有代码风格
- 为新功能添加测试
- 根据需要更新文档
- 保持提交专注和原子化

### 4. 提交指南
使用约定式提交消息：

```
type(scope): description

[optional body]

[optional footer]
```

**类型：**
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更改
- `style`: 代码风格更改
- `refactor`: 代码重构
- `test`: 添加或更新测试
- `chore`: 维护任务

**示例：**
```
feat(search): 添加多语言搜索支持
fix(nav): 解决移动导航问题
docs(guide): 更新快速开始教程
```

### 5. 提交 Pull Request
1. 将您的分支推送到您的 fork
2. 创建 pull request，包含：
   - 清晰的标题和描述
   - 链接到相关 issues
   - UI 更改的截图
   - 测试说明

## 代码风格

### TypeScript/JavaScript
- 使用 TypeScript 确保类型安全
- 遵循 ESLint 配置
- 使用有意义的变量名
- 为公共 API 添加 JSDoc 注释

### Markdown
- 使用一致的标题级别
- 包含代码示例
- 为图片添加 alt 文本
- 遵循写作风格指南

### CSS
- 使用 CSS 自定义属性
- 遵循 BEM 方法论
- 确保响应式设计
- 在多个浏览器中测试

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 在监视模式下运行测试
npm run test:watch

# 运行特定测试文件
npm test -- search.test.ts
```

### 编写测试
- 为新函数添加单元测试
- 包含功能的集成测试
- 测试边缘情况和错误条件
- 保持良好的测试覆盖率

## 文档

### 写作指南
- 使用清晰、简洁的语言
- 包含实用示例
- 逻辑性地组织内容
- 考虑不同技能水平

### API 文档
- 记录所有公共 API
- 包含参数类型和描述
- 提供使用示例
- 注明任何破坏性更改

## 审查流程

### 我们关注的内容
- **功能性**: 是否按预期工作？
- **代码质量**: 是否编写良好且可维护？
- **测试**: 是否有足够的测试？
- **文档**: 是否有适当的文档？
- **性能**: 是否影响性能？

### 审查时间线
- 2-3 天内初始审查
- 1-2 天内后续审查
- 批准并通过 CI 后合并

## 社区指南

### 保持尊重
- 使用包容性语言
- 在反馈中保持建设性
- 帮助他人学习和成长
- 尊重不同观点

### 沟通
- 使用 GitHub issues 报告错误
- 使用讨论区提问
- 加入我们的 Discord 进行实时聊天
- 遵循我们的行为准则

## 认可

贡献者将在以下地方得到认可：
- README 贡献者部分
- 发布说明
- 年度贡献者亮点
- 特殊贡献者徽章

## 获取帮助

### 资源
- [文档](/zh/guide/getting-started)
- [API 参考](/zh/api/introduction)
- [示例](/zh/examples/basic)
- [常见问题](/zh/guide/faq)

### 支持渠道
- **GitHub Issues**: 错误报告和功能请求
- **GitHub Discussions**: 问题和社区帮助
- **Discord**: 实时社区聊天
- **邮箱**: security@yourproject.com（仅安全问题）

## 许可证

通过贡献，您同意您的贡献将在与项目相同的许可证（MIT 许可证）下获得许可。

---

感谢您的贡献！🎉
