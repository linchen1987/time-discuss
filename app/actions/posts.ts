'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string, imageUrls?: string[]) {
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

  // 创建帖子
  await prisma.post.create({
    data: {
      authorId: user.id,
      lexicalState: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: content,
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
      },
      contentHtml: content,
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
  });

  revalidatePath('/');
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
