'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function createPost(lexicalState: Record<string, unknown> | null, contentHtml: string, imageUrls?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  // 如果没有 lexicalState，创建一个简单的状态
  const finalLexicalState = lexicalState || {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: contentHtml,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  // 创建帖子
  const newPost = await prisma.post.create({
    data: {
      authorId: user.id,
      lexicalState: finalLexicalState as any,
      contentHtml: contentHtml,
      images:
        imageUrls && imageUrls.length > 0
          ? {
              create: imageUrls.map((url) => ({
                url,
                altText: '',
              })),
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
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
      comments: {
        take: 3,
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

  revalidatePath('/');
  return newPost;
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  // 查找帖子并验证权限
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('帖子不存在');
  }

  if (post.authorId !== user.id) {
    throw new Error('无权限删除此帖子');
  }

  // 删除帖子
  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/');
}
