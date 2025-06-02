/**
 * 应用配置模板文件
 *
 * 使用说明：
 * 1. 复制此文件为 app.ts：cp config/app.template.ts config/app.ts
 * 2. 根据需要修改 app.ts 中的配置项
 * 3. app.ts 已添加到 .gitignore，不会被提交到版本库
 */
export const APP_CONFIG = {
  // 应用基本信息
  name: '朋友之家', // 应用完整名称，显示在页面标题、导航栏等位置
  shortName: '朋友之家', // 应用简短名称，用于PWA安装时的图标下方文字
  description: '与朋友分享生活的美好时光', // 应用简短描述，显示在首页右侧栏

  // SEO 相关
  seoDescription: '一个私密温馨的社交平台，与朋友分享生活的美好时光', // 详细描述，用于SEO和PWA配置
  keywords: ['社交', '朋友', '分享', '生活'], // 关键词数组，用于SEO优化

  // 品牌相关
  author: 'Your Name', // 作者信息
  url: 'https://your-domain.com', // 应用域名（用于SEO）

  // 功能开关
  features: {
    allowRegistration: true, // 是否允许用户注册
    enableNotifications: true, // 是否启用通知功能
    enableComments: true, // 是否启用评论功能
    enableLikes: true, // 是否启用点赞功能
  },
} as const;

// 导出类型供 TypeScript 使用
export type AppConfig = typeof APP_CONFIG;
