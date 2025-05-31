import { z } from 'zod';

// 用户相关验证
export const userValidation = {
  // 注册验证
  register: z.object({
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .max(20, '用户名最多20个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    email: z.string().email('请输入有效的邮箱地址').optional(),
    password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
    name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50个字符').optional(),
  }),

  // 登录验证
  login: z.object({
    identifier: z.string().min(1, '用户名或邮箱不能为空'),
    password: z.string().min(1, '密码不能为空'),
  }),

  // 更新资料验证
  updateProfile: z.object({
    name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50个字符').optional(),
    avatarUrl: z
      .string()
      .refine((url) => {
        if (!url) return true; // 允许空值
        // 允许相对路径（以/开头）或完整URL
        return url.startsWith('/') || z.string().url().safeParse(url).success;
      }, '请输入有效的头像URL或路径')
      .optional(),
  }),
};

// 帖子相关验证
export const postValidation = {
  // 创建帖子验证
  create: z.object({
    lexicalState: z.record(z.unknown()).refine((data) => data && typeof data === 'object', {
      message: '帖子内容格式无效',
    }),
    contentHtml: z.string().max(10000, '帖子内容过长').optional(),
    images: z
      .array(
        z.object({
          url: z.string().url('图片URL无效'),
          altText: z.string().max(200, '图片描述最多200个字符').optional(),
        })
      )
      .max(9, '最多上传9张图片')
      .optional(),
  }),

  // 获取帖子列表验证
  list: z.object({
    cursor: z.string().optional(),
    limit: z.number().min(1, '每页至少1条').max(50, '每页最多50条').default(10),
    userId: z.string().optional(),
  }),
};

// 评论相关验证
export const commentValidation = {
  // 创建评论验证
  create: z.object({
    postId: z.string().min(1, '帖子ID不能为空'),
    lexicalState: z.record(z.unknown()).nullable(),
    contentHtml: z.string().optional(),
    content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容最多1000个字符'),
    imageUrls: z.array(z.string().url()).optional().default([]),
    parentId: z.string().optional(),
    replyToUserId: z.string().optional(),
  }),

  // 更新评论验证
  update: z.object({
    lexicalState: z.record(z.unknown()).nullable(),
    contentHtml: z.string().optional(),
    content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容最多1000个字符'),
    imageUrls: z.array(z.string().url()).optional().default([]),
  }),
};

// 通知相关验证
export const notificationValidation = {
  // 获取通知列表验证
  list: z.object({
    unreadOnly: z.boolean().default(false),
    limit: z.number().min(1, '每页至少1条').max(100, '每页最多100条').default(20),
  }),
};

// 图片上传验证
export const uploadValidation = {
  image: z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: '图片大小不能超过5MB',
      })
      .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type), {
        message: '只支持 JPEG、PNG、WebP 和 GIF 格式的图片',
      }),
  }),
};

// PWA 推送订阅验证
export const pushSubscriptionValidation = {
  subscribe: z.object({
    endpoint: z.string().url('推送端点URL无效'),
    p256dh: z.string().min(1, 'p256dh 密钥不能为空'),
    auth: z.string().min(1, 'auth 密钥不能为空'),
  }),
};

// 通用验证
export const commonValidation = {
  // ID 验证
  id: z.string().min(1, 'ID不能为空'),

  // 分页验证
  pagination: z.object({
    page: z.number().min(1, '页码至少为1').default(1),
    limit: z.number().min(1, '每页至少1条').max(100, '每页最多100条').default(10),
    cursor: z.string().optional(),
  }),
};
