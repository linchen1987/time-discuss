# 朋友之家 - 私密社交平台

一个基于 Next.js 构建的温馨私密社交平台，支持 PWA (渐进式Web应用) 功能。

## ✨ 主要功能

- 📱 **PWA 支持** - 可安装为手机/桌面应用
- 💬 **实时社交** - 帖子发布、评论互动
- 🎨 **现代UI** - 基于 Tailwind CSS 的美观界面
- 🔐 **用户认证** - 安全的登录注册系统
- 📝 **富文本编辑** - 支持 Markdown 和富文本内容

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 生成 PWA 图标

```bash
npm run pwa:icons
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 验证 PWA 功能

```bash
npm run pwa:test
```

## 📱 PWA 功能

### 应用安装

#### 在 Android Chrome 上：
1. 访问网站
2. 点击右下角的"安装应用"按钮
3. 或使用浏览器菜单中的"添加到主屏幕"

#### 在 iOS Safari 上：
1. 访问网站
2. 点击分享按钮
3. 选择"添加到主屏幕"

#### 在桌面浏览器上：
1. 访问网站
2. 地址栏会显示安装图标
3. 点击安装即可

### PWA 特性
- ✅ 离线基础支持
- ✅ 应用安装提示
- ✅ 独立窗口运行
- ✅ 自定义图标和启动画面
- 🚧 推送通知（预留功能）

## 🛠️ 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 数据库相关
npm run db:seed      # 填充测试数据
npm run db:studio    # 打开数据库管理界面
npm run db:reset     # 重置数据库

# PWA 相关
npm run pwa:icons    # 生成 PWA 图标
npm run pwa:test     # 验证 PWA 功能
```

## 📁 项目结构

```
├── app/                 # Next.js App Router
├── components/          # React 组件
│   └── pwa-installer.tsx # PWA 安装器
├── public/              # 静态资源
│   ├── manifest.json    # PWA 配置
│   ├── sw.js           # Service Worker
│   └── icons/          # PWA 图标
├── scripts/            # 工具脚本
├── docs/               # 文档
└── prisma/             # 数据库配置
```

## 🔧 技术栈

- **框架**: Next.js 15
- **样式**: Tailwind CSS
- **数据库**: Prisma + SQLite
- **认证**: NextAuth.js
- **PWA**: Web App Manifest + Service Worker
- **类型**: TypeScript

## 📖 文档

- [PWA 实现方案](./docs/3.pwa-setup.md)
- [需求文档](./docs/1.requirements.md)
- [技术设计](./docs/2.tech-design.md)

## 🌐 部署

推荐使用 [Vercel Platform](https://vercel.com/new) 部署，这是 Next.js 的创建者提供的平台。

**注意**: PWA 功能需要 HTTPS 环境才能正常工作（开发环境的 localhost 除外）。

## 🔍 PWA 验证

使用 Chrome DevTools 验证 PWA 功能：

1. 打开开发者工具
2. 转到 **Application** 标签
3. 查看 **Manifest** 和 **Service Workers** 部分
4. 使用 **Lighthouse** 进行 PWA 审计

## 💡 提示

- 如需 PNG 格式图标，可访问 [svgtopng.com](https://svgtopng.com/) 转换 SVG 文件
- PWA 安装条件：HTTPS + Manifest + Service Worker + 用户交互
- 开发时可能需要清除缓存查看 Service Worker 更新
