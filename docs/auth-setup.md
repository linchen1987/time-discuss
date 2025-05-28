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

### 3. 页面组件

#### 登录页面
- **路径**: `/auth/login`
- **功能**: 用户名/密码登录表单
- **特性**: 表单验证、错误处理、加载状态

#### 注册页面
- **路径**: `/auth/register`
- **功能**: 用户注册表单
- **特性**: 密码确认、表单验证、成功提示

#### 导航组件
- **位置**: `components/Navigation.tsx`
- **功能**: 显示登录状态、登录/登出按钮
- **特性**: 会话状态检测、用户信息显示

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

### 2. 数据库设置

```bash
# 推送数据库模式
npx prisma db push

# 生成 Prisma 客户端
npx prisma generate
```

### 3. 启动应用

```bash
npm run dev
```

### 4. 测试功能

1. 访问 `http://localhost:3000`
2. 点击"注册"按钮创建账号
3. 使用新账号登录
4. 验证会话状态和登出功能

## 代码结构

```
lib/
├── auth.ts              # NextAuth.js 配置
├── providers.tsx        # SessionProvider 包装器
├── validations.ts       # 数据验证规则
└── types/
    └── next-auth.d.ts   # NextAuth.js 类型扩展

app/
├── api/auth/
│   ├── [...nextauth]/route.ts  # NextAuth.js API 路由
│   └── register/route.ts       # 用户注册 API
└── auth/
    ├── login/page.tsx          # 登录页面
    └── register/page.tsx       # 注册页面

components/
└── Navigation.tsx       # 导航组件
```

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

### 调试技巧

1. 检查浏览器开发者工具的网络标签
2. 查看服务器控制台日志
3. 使用 Prisma Studio 检查数据库数据：`npx prisma studio`

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

### 登录测试

访问 `/auth/login` 页面，使用注册的用户名和密码登录。

## 总结

认证系统已完全实现并可以正常使用。用户可以注册账号、登录、查看会话状态并安全登出。系统具备良好的安全性和用户体验。 