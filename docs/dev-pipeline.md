# 朋友之家开发流程与部署管线

## 开发工作流

### 1. 开发环境配置

1. **本地开发环境**
   - 安装 Node.js (v18+)
   - 安装 Git
   - 推荐使用 VS Code 作为 IDE
   - 安装推荐的 VS Code 扩展:
     - ESLint
     - Prettier
     - Tailwind CSS IntelliSense
     - TypeScript Vue Plugin (Volar)
     - Prisma

2. **项目克隆与设置**
   ```bash
   git clone [repository-url]
   cd time-discuss
   npm install
   cp .env.example .env.local  # 复制并配置环境变量
   ```

3. **本地数据库设置**
   - 开发阶段可使用 Docker 容器运行 PostgreSQL
   ```bash
   docker run --name time-discuss-db -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=myuser -e POSTGRES_DB=timediscuss -p 5432:5432 -d postgres:14
   ```
   - 更新 .env.local 中的 DATABASE_URL
   - 运行数据库迁移
   ```bash
   npx prisma migrate dev
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 2. 分支管理策略

1. **分支命名规范**
   - `main` - 主分支，包含生产就绪代码
   - `develop` - 开发分支，所有功能分支合并到此
   - `feature/[feature-name]` - 功能分支
   - `fix/[bug-name]` - 修复分支
   - `release/v[version]` - 发布分支

2. **开发流程**
   - 从 `develop` 创建新功能分支
   - 完成开发后，创建 Pull Request 合并回 `develop`
   - 定期从 `develop` 创建 `release` 分支
   - 测试通过后，将 `release` 分支合并到 `main`

3. **提交规范**
   - 使用 Conventional Commits 格式
   - 格式: `<type>(<scope>): <description>`
   - 类型:
     - `feat`: 新功能
     - `fix`: Bug 修复
     - `docs`: 文档更新
     - `style`: 代码格式 (不影响代码运行)
     - `refactor`: 重构代码
     - `test`: 测试相关
     - `chore`: 工具链或配置更改

### 3. 代码审查

1. **审查标准**
   - 代码是否符合项目编码规范
   - 功能是否完整实现需求
   - 是否有适当的错误处理
   - 是否考虑了边缘情况
   - UI 是否符合设计意图
   - 是否有必要的测试覆盖

2. **审查流程**
   - 创建 Pull Request 时填写详细描述
   - 至少一名团队成员审查
   - 解决所有评论后方可合并
   - 确保所有 CI 检查通过

## 部署流程

### 1. 部署环境

1. **开发环境**
   - 自动部署 `develop` 分支
   - 用于团队内部测试

2. **预发布环境**
   - 自动部署 `release/*` 分支
   - 用于最终验收测试

3. **生产环境**
   - 手动触发从 `main` 分支部署
   - 严格控制部署时间和流程

### 2. Vercel 部署配置

1. **项目配置**
   - 连接 GitHub 仓库
   - 配置构建命令:
   ```
   npm run build
   ```
   - 输出目录: `.next`
   - Node.js 版本: 18.x

2. **环境变量**
   - 在 Vercel 项目设置中添加所有必需的环境变量:
     - DATABASE_URL
     - NEXTAUTH_SECRET
     - NEXTAUTH_URL
     - OAUTH_CLIENT_IDs 和 SECRETs
     - VAPID 密钥
     - 其他服务的 API 密钥

3. **域名配置**
   - 在 Vercel 中为每个环境配置子域名
     - 开发环境: `dev.yourapp.com`
     - 预发布环境: `staging.yourapp.com`
     - 生产环境: `yourapp.com`

### 3. 数据库迁移流程

1. **开发环境迁移**
   - 本地生成迁移文件
   ```bash
   npx prisma migrate dev --name [migration-name]
   ```
   - 提交迁移文件到代码仓库

2. **生产环境迁移**
   - 使用 Prisma Migrate 部署迁移
   ```bash
   npx prisma migrate deploy
   ```
   - 配置 Vercel 构建命令包含迁移步骤:
   ```
   npm run build && npx prisma migrate deploy
   ```

3. **数据备份策略**
   - 在重要迁移前进行数据库备份
   - 定期进行自动备份
   - 保存至少 7 天的备份历史

## 监控与维护

### 1. 性能监控

1. **前端监控**
   - 使用 Vercel Analytics 跟踪前端性能
   - 关注 Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS)

2. **后端监控**
   - 监控 Serverless Functions 执行时间和内存使用
   - 设置超时警报
   - 跟踪 API 错误率

### 2. 错误跟踪

1. **错误捕获**
   - 前端: 使用全局错误边界组件
   - 后端: 使用 try/catch 并记录所有异常

2. **错误报告**
   - 集成 Sentry 或 Vercel Error Tracking
   - 配置异常通知 (Slack, Email)

### 3. 更新维护流程

1. **依赖更新**
   - 每月检查并更新依赖
   - 使用 npm audit 检查安全漏洞
   - 自动化依赖更新 PR (使用 Dependabot)

2. **定期维护任务**
   - 清理未使用的 Blob 存储对象
   - 优化数据库查询
   - 检查 API 使用配额

## 紧急情况处理

### 1. 回滚流程

1. **代码回滚**
   - 在 Vercel 控制台回滚到上一个稳定部署
   - 或推送回滚提交到 `main` 分支

2. **数据库回滚**
   - 从最近的备份恢复数据库
   - 运行特定的回滚迁移

### 2. 应急联系方式

创建应急联系列表，包含:
- 项目负责人
- 后端开发负责人
- 前端开发负责人
- 运维负责人
- 关键外部服务商的支持联系方式

## 持续集成

### 1. 自动化测试

1. **测试策略**
   - 单元测试: 使用 Jest 测试独立组件和函数
   - 集成测试: 测试组件间交互
   - E2E 测试: 使用 Playwright/Cypress 测试主要用户流程

2. **CI 配置**
   - 设置 GitHub Actions 运行测试
   - 每次 PR 和推送到主要分支时运行测试
   - 生成测试覆盖报告

### 2. 代码质量检查

1. **自动化检查**
   - ESLint: 代码风格和潜在问题
   - TypeScript 类型检查
   - 测试覆盖率阈值

2. **预发布验证**
   - 创建预发布检查清单
   - 在生产部署前运行完整检查 