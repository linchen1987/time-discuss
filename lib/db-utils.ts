import { prisma } from './prisma';
import { NotificationType, type PostWithDetails, type NotificationWithDetails } from './types';

// 用户相关操作
export const userOperations = {
  // 根据用户名或邮箱查找用户
  async findByUsernameOrEmail(identifier: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
  },

  // 创建新用户
  async create(data: { username?: string; email?: string; name?: string; hashedPassword?: string; avatarUrl?: string }) {
    return await prisma.user.create({
      data,
    });
  },

  // 更新用户资料
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatarUrl?: string;
    }
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },
};

// 帖子相关操作
export const postOperations = {
  // 获取帖子列表（带分页）
  async getPostsWithDetails(
    options: {
      cursor?: string;
      limit?: number;
      userId?: string;
    } = {}
  ): Promise<PostWithDetails[]> {
    const { cursor, limit = 10, userId } = options;

    const posts = await prisma.post.findMany({
      where: userId ? { authorId: userId } : undefined,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
        comments: {
          take: 3, // 只显示最新的3条评论
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts as PostWithDetails[];
  },

  // 创建新帖子
  async create(data: { authorId: string; lexicalState: any; contentHtml?: string; images?: { url: string; altText?: string }[] }) {
    return await prisma.post.create({
      data: {
        authorId: data.authorId,
        lexicalState: data.lexicalState,
        contentHtml: data.contentHtml,
        images: data.images
          ? {
              create: data.images,
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        images: true,
      },
    });
  },

  // 删除帖子
  async delete(postId: string, userId: string) {
    // 确保只有作者可以删除自己的帖子
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    return await prisma.post.delete({
      where: { id: postId },
    });
  },
};

// 评论相关操作
export const commentOperations = {
  // 添加评论
  async create(data: { content: string; authorId: string; postId: string }) {
    const comment = await prisma.comment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 创建通知给帖子作者
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true },
    });

    if (post && post.authorId !== data.authorId) {
      await notificationOperations.create({
        recipientId: post.authorId,
        actorId: data.authorId,
        type: NotificationType.NEW_COMMENT,
        postId: data.postId,
      });
    }

    return comment;
  },

  // 删除评论
  async delete(commentId: string, userId: string) {
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: userId,
      },
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    return await prisma.comment.delete({
      where: { id: commentId },
    });
  },
};

// 点赞相关操作
export const likeOperations = {
  // 切换点赞状态
  async toggle(userId: string, postId: string) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      // 创建通知给帖子作者
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      if (post && post.authorId !== userId) {
        await notificationOperations.create({
          recipientId: post.authorId,
          actorId: userId,
          type: NotificationType.NEW_LIKE,
          postId,
        });
      }

      return { liked: true };
    }
  },
};

// 通知相关操作
export const notificationOperations = {
  // 创建通知
  async create(data: { recipientId: string; actorId?: string; type: NotificationType; postId?: string }) {
    return await prisma.notification.create({
      data,
    });
  },

  // 获取用户通知
  async getByUserId(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
    } = {}
  ): Promise<NotificationWithDetails[]> {
    const { unreadOnly = false, limit = 20 } = options;

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
        read: unreadOnly ? false : undefined,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: {
            id: true,
            contentHtml: true,
          },
        },
      },
    });

    return notifications as NotificationWithDetails[];
  },

  // 标记通知为已读
  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: {
        read: true,
      },
    });
  },

  // 标记所有通知为已读
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },
};

// PWA 推送订阅相关操作
export const pushSubscriptionOperations = {
  // 保存推送订阅
  async save(
    userId: string,
    subscription: {
      endpoint: string;
      p256dh: string;
      auth: string;
    }
  ) {
    return await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    });
  },

  // 获取用户的推送订阅
  async getByUserId(userId: string) {
    return await prisma.pushSubscription.findMany({
      where: { userId },
    });
  },

  // 删除推送订阅
  async delete(endpoint: string) {
    return await prisma.pushSubscription.delete({
      where: { endpoint },
    });
  },
};

// 简化的获取帖子函数，用于首页
export async function getPosts() {
  return await postOperations.getPostsWithDetails({ limit: 20 });
}
