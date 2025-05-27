# 数据库配置和数据建模

## 概述

本项目使用 PostgreSQL 作为主数据库，通过 Prisma ORM 进行数据库操作。数据库设计遵循朋友之家社交平台的需求，支持用户管理、帖子发布、评论互动、点赞功能和通知系统。

## 数据库架构

### 核心表结构

1. **用户表 (users)**
   - 支持用户名/密码登录和 OAuth 登录
   - 存储用户基本信息（用户名、邮箱、姓名、头像）
   - 兼容 NextAuth.js 认证系统

2. **帖子表 (posts)**
   - 存储 Lexical 编辑器的 JSON 状态
   - 支持富文本内容和 HTML 备份
   - 关联图片和互动数据

3. **图片表 (post_images)**
   - 存储帖子关联的图片 URL
   - 支持图片描述和元数据

4. **评论表 (comments)**
   - 支持对帖子的评论功能
   - 纯文本格式，简化初期实现

5. **点赞表 (likes)**
   - 用户对帖子的点赞记录
   - 唯一约束防止重复点赞

6. **通知表 (notifications)**
   - 支持评论、点赞、提及等通知类型
   - 已读/未读状态管理

7. **推送订阅表 (push_subscriptions)**
   - PWA 推送通知订阅信息
   - VAPID 密钥存储

8. **NextAuth.js 相关表**
   - accounts: OAuth 账户信息
   - sessions: 用户会话管理
   - verification_tokens: 邮箱验证和密码重置

## 环境配置

### 1. 环境变量设置

创建 `.env.local` 文件（或复制 `.env.example`）：

```env
# 数据库连接
DATABASE_URL="postgresql://postgres:123456@localhost:5432/time_discuss?schema=public"

# NextAuth.js 配置
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OAuth 提供商（可选）
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""

# PWA 推送通知（可选）
# VAPID_PUBLIC_KEY=""
# VAPID_PRIVATE_KEY=""

# 对象存储（可选）
# VERCEL_BLOB_READ_WRITE_TOKEN=""
```

### 2. 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# 运行种子数据
npm run db:seed
```

### 3. 可用脚本

```bash
# 开发环境数据库操作
npm run db:seed      # 运行种子数据
npm run db:studio    # 打开 Prisma Studio
npm run db:reset     # 重置数据库并重新种子
```

## 数据模型特点

### 1. 灵活的用户认证
- 支持传统用户名/密码登录
- 兼容 OAuth 第三方登录
- 用户名和邮箱都是可选的，适应不同登录方式

### 2. 富文本内容存储
- 使用 Lexical 编辑器的 JSON 格式存储
- 同时保存 HTML 版本用于展示
- 支持图片、链接、格式化文本等

### 3. 完整的社交功能
- 帖子发布和展示
- 评论系统
- 点赞功能（防重复）
- 实时通知

### 4. PWA 支持
- 推送订阅管理
- 离线数据缓存准备

## 测试数据

种子数据包含：
- 3 个测试用户（admin, user1, user2）
- 2 条测试帖子
- 评论和点赞示例
- 通知示例

默认登录信息：
- 用户名：admin / user1 / user2
- 密码：123456

## 数据库工具

项目提供了完整的数据库操作工具：

- `lib/prisma.ts`: Prisma 客户端配置
- `lib/db-utils.ts`: 数据库操作函数
- `lib/types.ts`: TypeScript 类型定义
- `lib/validations.ts`: 数据验证 schema

## 生产环境注意事项

1. **安全性**
   - 更改默认密码和密钥
   - 使用强密码哈希
   - 配置 HTTPS

2. **性能优化**
   - 添加数据库索引
   - 实现连接池
   - 考虑读写分离

3. **备份策略**
   - 定期数据库备份
   - 迁移脚本管理
   - 监控和日志

## 扩展计划

- 用户提及 (@mention) 功能
- 帖子搜索功能
- 图片压缩和 CDN 集成
- 实时消息推送
- 数据分析和统计 