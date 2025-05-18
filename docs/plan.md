# 朋友之家实现计划

## 阶段 1: 项目初始化与基础设置

1. **项目创建与依赖安装**
   - 使用 create-next-app 创建 Next.js 13+ 项目（使用 App Router）
   - 配置 TypeScript
   - 安装核心依赖：Tailwind CSS, Prisma, NextAuth.js, Zod

2. **代码结构设置**
   - 建立基础目录结构（app, components, lib, public, prisma）
   - 配置 ESLint、Prettier
   - 设置 Git 仓库

3. **环境与配置**
   - 创建环境变量配置文件 (.env, .env.example)
   - 配置 next.config.mjs
   - 设置 Tailwind CSS 配置

## 阶段 2: 数据库与认证系统

4. **数据库模型设计**
   - 创建 Prisma schema (User, Post, PostImage, Comment, Like, Notification)
   - 配置数据库连接（Vercel Postgres 或 PlanetScale）
   - 生成并测试 Prisma client

5. **认证系统实现**
   - 配置 NextAuth.js
   - 实现用户名/密码认证
   - 添加 OAuth 提供商配置（Google, GitHub）
   - 创建认证相关 UI 组件

6. **用户管理**
   - 实现用户注册流程
   - 添加用户资料更新功能
   - 创建用户头像上传功能
   - 测试用户认证流程

## 阶段 3: 核心 UI 组件

7. **基础 UI 组件**
   - 创建通用按钮组件
   - 实现输入框、表单组件
   - 设计卡片、头像等基础组件
   - 添加模态框组件

8. **布局与导航**
   - 创建应用根布局
   - 实现导航栏组件
   - 添加认证布局
   - 设计响应式布局与移动优化

9. **LexicalJS 编辑器集成**
   - 安装 Lexical 及插件
   - 创建基础编辑器组件
   - 添加工具栏功能
   - 实现 Markdown 支持
   - 测试编辑器功能

## 阶段 4: 核心功能实现

10. **帖子功能**
    - 实现帖子创建 (Server Action)
    - 添加帖子展示组件
    - 创建帖子详情页面
    - 实现帖子删除功能

11. **图片上传功能**
    - 配置 Vercel Blob 或 Cloudflare R2
    - 实现图片上传 API
    - 集成图片上传功能到编辑器
    - 测试图片展示与优化

12. **互动功能实现**
    - 添加点赞功能
    - 实现评论创建与展示
    - 完成评论删除功能
    - 测试互动功能工作流

## 阶段 5: 信息流与通知

13. **主信息流实现**
    - 创建首页信息流展示
    - 实现无限滚动加载
    - 添加信息流刷新功能
    - 优化信息流性能

14. **通知系统**
    - 实现通知数据模型
    - 创建通知触发逻辑
    - 添加通知列表页面
    - 实现标记已读功能

15. **Web Push 通知**
    - 生成 VAPID 密钥
    - 实现通知订阅 API
    - 创建 Service Worker 通知处理
    - 测试推送通知流程

## 阶段 6: PWA 功能与部署准备

16. **PWA 实现**
    - 创建 manifest.json
    - 配置图标与主题色
    - 实现基础 Service Worker
    - 添加离线缓存功能

17. **性能优化**
    - 图片优化（Next.js Image）
    - 组件懒加载
    - 代码分割优化
    - 性能测试与修复

18. **安全与健壮性**
    - 实现输入验证
    - 添加错误边界组件
    - 安全检查与修复
    - 端到端测试主要流程

## 阶段 7: 部署与集成

19. **Vercel 部署准备**
    - 创建 Vercel 项目
    - 配置环境变量
    - 设置构建命令
    - 测试预览部署

20. **CI/CD 与监控**
    - 配置 GitHub Actions
    - 添加自动化测试
    - 设置项目监控
    - 最终部署与验证

## 详细任务分解

### 阶段 1-1: 项目创建与依赖安装

1. 使用 create-next-app 创建项目：
   ```bash
   npx create-next-app@latest time-discuss --typescript --tailwind --app --eslint
   ```

2. 安装核心依赖：
   ```bash
   cd time-discuss
   npm install prisma @prisma/client next-auth@beta zod bcrypt
   npm install -D @types/bcrypt
   npx prisma init
   ```

3. 安装 Lexical 相关依赖：
   ```bash
   npm install lexical @lexical/react @lexical/link @lexical/list @lexical/markdown
   ```

### 阶段 1-2: 代码结构设置

1. 创建额外的目录结构：
   ```bash
   mkdir -p app/api
   mkdir -p components/{ui,auth,editor,posts,shell}
   mkdir -p lib/utils
   mkdir -p public/{icons,images}
   ```

2. 配置 Prettier：
   ```bash
   touch .prettierrc.json
   ```
   添加基本配置

### 阶段 1-3: 环境与配置

1. 创建环境变量文件：
   ```bash
   touch .env.example
   ```
   添加：
   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. 配置 Tailwind CSS：
   - 修改 tailwind.config.js 添加自定义主题

### 阶段 2-1: 数据库模型设计

1. 编辑 prisma/schema.prisma 文件，添加数据模型（根据技术设计中的模型）

2. 运行初始化迁移：
   ```bash
   npx prisma migrate dev --name init
   ```

3. 创建 lib/prisma.ts 文件设置 Prisma Client

### 阶段 2-2: 认证系统实现

1. 创建 NextAuth 配置文件：
   - app/api/auth/[...nextauth]/route.ts

2. 创建核心认证组件：
   - components/auth/LoginForm.tsx
   - components/auth/RegisterForm.tsx

3. 创建认证页面：
   - app/(auth)/login/page.tsx
   - app/(auth)/register/page.tsx

### 阶段 3-1: 基础 UI 组件

1. 创建按钮组件：
   - components/ui/Button.tsx

2. 创建输入组件：
   - components/ui/Input.tsx
   - components/ui/TextArea.tsx

3. 创建卡片组件：
   - components/ui/Card.tsx

4. 创建头像组件：
   - components/ui/Avatar.tsx

### 阶段 3-2: 布局与导航

1. 创建根布局：
   - app/layout.tsx

2. 创建认证布局：
   - app/(auth)/layout.tsx

3. 创建应用布局：
   - app/(app)/layout.tsx

4. 创建导航组件：
   - components/shell/Navbar.tsx

### 阶段 4-1: LexicalJS 编辑器集成

1. 创建基础编辑器组件：
   - components/editor/LexicalEditor.tsx

2. 创建编辑器工具栏：
   - components/editor/Toolbar.tsx

3. 创建自定义插件：
   - components/editor/plugins/ImagePlugin.tsx

### 详细步骤进度跟踪表格

| 任务ID | 任务描述 | 状态 | 依赖任务 |
|--------|---------|------|---------|
| 1.1    | 创建 Next.js 项目 | 待开始 | - |
| 1.2    | 安装核心依赖 | 待开始 | 1.1 |
| 1.3    | 安装 Lexical 依赖 | 待开始 | 1.2 |
| 2.1    | 创建基础目录结构 | 待开始 | 1.3 |
| 2.2    | 配置 ESLint、Prettier | 待开始 | 2.1 |
| 3.1    | 创建环境变量配置 | 待开始 | 2.2 |
| 3.2    | 配置 Tailwind CSS | 待开始 | 3.1 |
| 4.1    | 创建 Prisma 模型 | 待开始 | 3.2 |
| 4.2    | 初始化数据库迁移 | 待开始 | 4.1 |
| 5.1    | 配置 NextAuth.js | 待开始 | 4.2 |
| 5.2    | 创建认证 UI 组件 | 待开始 | 5.1 |
| 6.1    | 实现用户注册流程 | 待开始 | 5.2 |
| 6.2    | 添加用户资料功能 | 待开始 | 6.1 |
| 7.1    | 创建基础 UI 组件 | 待开始 | 3.2 |
| 8.1    | 创建应用布局 | 待开始 | 7.1 |
| 9.1    | 创建 Lexical 编辑器 | 待开始 | 7.1, 1.3 |
