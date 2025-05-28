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
   docker run --name time-discuss-db -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=myuser -e POSTGRES_DB=timediscuss -p 5432:5432 -d postgres:16
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

## 部署流程

### 1. Vercel 部署配置

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

### 2. 数据库迁移流程

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
