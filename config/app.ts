/**
 * 应用配置文件（所有配置均从 .env 读取）
 *
 * 说明：所有配置项都应在 .env 文件中设置。
 */
export const APP_CONFIG = {
  // 应用基本信息
  name: process.env.NEXT_PUBLIC_APP_NAME!,
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || process.env.NEXT_PUBLIC_APP_NAME!,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION!,

  // SEO 相关
  seoDescription: process.env.NEXT_PUBLIC_APP_SEO_DESCRIPTION!, // 详细描述，用于SEO和PWA配置
  keywords: (process.env.NEXT_PUBLIC_APP_KEYWORDS || '').split(',').map((k) => k.trim()), // 关键词数组，用于SEO优化

  // 品牌相关
  author: process.env.NEXT_PUBLIC_APP_AUTHOR!, // 作者信息
  url: process.env.NEXT_PUBLIC_APP_URL!, // 应用域名（用于SEO）

  // 功能开关
  features: {
    registrationDisabled: process.env.NEXT_PUBLIC_FEATURE_REGISTRATION_DISABLED === 'true', // 是否禁用注册
    notificationsDisabled: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS_DISABLED === 'true', // 是否禁用通知
    commentsDisabled: process.env.NEXT_PUBLIC_FEATURE_COMMENTS_DISABLED === 'true', // 是否禁用评论
    likesDisabled: process.env.NEXT_PUBLIC_FEATURE_LIKES_DISABLED === 'true', // 是否禁用点赞
  },
} as const;

// 导出类型供 TypeScript 使用
export type AppConfig = typeof APP_CONFIG;
