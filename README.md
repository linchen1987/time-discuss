一个基于 Next.js 构建的社交平台，支持 PWA (渐进式Web应用) 功能。

## ✨ 主要功能

- 📱 **PWA 支持** - 可安装为手机/桌面应用
- 💬 **社交分享** - 帖子发布、评论互动
- 🎨 **现代UI** - 基于 Tailwind CSS 的美观界面
- 🔐 **用户认证** - 安全的登录注册系统
- 📝 **富文本编辑** - 支持 Markdown 和富文本内容

## 🚀 快速部署

1. **安装依赖**
   ```bash
   npm install
   ```
2. **构建项目**
   ```bash
   npm run build
   ```
3. **配置环境变量**
   ```bash
   # 按提示修改 .env
   cp .env.example .env
   ```
4. **初始化数据库**
     ```bash
     npx prisma migrate deploy
     ```
5. **启动服务**
   ```bash
   npm run start
   ```

## 🚀 快速开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。


## 🚀 快速开发

1. **安装依赖**
   ```bash
   npm install
   ```
2. **配置环境变量**
     ```bash
     # 按提示修改 .env
     cp .env.example .env
     ```
3. **更新数据库结构**
     ```bash
     npx prisma db push
     ```
6. **启动服务**
   ```bash
   npm run dev
   ```

## 🔧 技术栈

- **框架**: Next.js 15
- **样式**: Tailwind CSS
- **数据库**: Prisma + SQLite
- **认证**: NextAuth.js
- **PWA**: Web App Manifest + Service Worker
- **类型**: TypeScript
