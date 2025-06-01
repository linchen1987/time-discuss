# 认证系统设置和使用说明

## 概述

朋友之家项目已实现了完整的用户名/密码认证系统，包括：

- 用户注册
- 用户登录
- 会话管理
- 登出功能
- 受保护的路由

## 技术栈

- **NextAuth.js v4**: 认证框架
- **Prisma**: 数据库ORM
- **bcryptjs**: 密码加密
- **Zod**: 数据验证
- **PostgreSQL**: 数据库

## 已实现的功能

### 1. 数据库模型

用户表包含以下字段：
- `id`: 唯一标识符
- `username`: 用户名（唯一）
- `email`: 邮箱（可选，唯一）
- `hashedPassword`: 加密后的密码
- `name`: 显示名称（可选）
- `avatarUrl`: 头像URL（可选）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 2. API端点

#### 注册 API
- **路径**: `POST /api/auth/register`
- **功能**: 创建新用户账号
- **验证**: 用户名唯一性、邮箱格式、密码强度

#### NextAuth.js API
- **路径**: `/api/auth/[...nextauth]`
- **功能**: 处理登录、登出、会话管理

## 使用方法

### 1. 环境配置

创建 `.env` 文件并设置以下变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/time_discuss"

# NextAuth.js 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. 测试功能

1. 访问 `http://localhost:3000`
2. 点击"注册"按钮创建账号
3. 使用新账号登录
4. 验证会话状态和登出功能

## 安全特性

1. **密码加密**: 使用 bcryptjs 进行密码哈希
2. **会话管理**: JWT 策略，安全的会话处理
3. **输入验证**: Zod 验证所有用户输入
4. **CSRF 保护**: NextAuth.js 内置 CSRF 保护
5. **类型安全**: TypeScript 类型检查

## 下一步开发

1. 添加邮箱验证功能
2. 实现密码重置功能
3. 添加OAuth登录（Google、GitHub等）
4. 实现用户资料管理
5. 添加角色和权限系统

## 故障排除

### 常见问题

1. **NextAuth.js 类型错误**
   - 确保 `lib/types/next-auth.d.ts` 文件存在
   - 重启 TypeScript 服务器

2. **数据库连接错误**
   - 检查 `DATABASE_URL` 环境变量
   - 确保 PostgreSQL 服务正在运行

3. **会话不持久**
   - 检查 `NEXTAUTH_SECRET` 环境变量
   - 确保 `NEXTAUTH_URL` 设置正确


## API 测试示例

### 注册新用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "name": "测试用户",
    "email": "test@example.com"
  }'
```
