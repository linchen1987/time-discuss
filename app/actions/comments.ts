'use server';

import { prisma } from '@/lib/prisma';
import { commentValidation } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { logError } from '@/lib/debug';
import type { CommentWithDetails } from '@/lib/types';

// 从编辑器状态中提取纯文本
function extractTextFromLexical(lexicalState: Record<string, unknown> | null): string {
  if (!lexicalState || !lexicalState.root) {
    return '';
  }

  const extractTextFromNode = (node: Record<string, unknown>): string => {
    let text = '';

    if (node.type === 'text') {
      text += (node.text as string) || '';
    } else if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        text += extractTextFromNode(child as Record<string, unknown>);
      }
    }

    return text;
  };

  return extractTextFromNode(lexicalState.root as Record<string, unknown>).trim();
}

// 创建评论 - 简化版本
export async function createComment(
  userId: string,
  postId: string,
  lexicalState: Record<string, unknown> | null,
  contentHtml: string,
  imageUrls: string[] = [],
  parentId?: string,
  replyToUserId?: string
): Promise<CommentWithDetails> {
  try {
    // 提取纯文本内容
    const content = extractTextFromLexical(lexicalState);

    // 验证数据
    const validatedData = commentValidation.create.parse({
      postId,
      lexicalState,
      contentHtml,
      content,
      imageUrls,
      parentId,
      replyToUserId,
    });

    // 验证帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new Error('帖子不存在');
    }

    // 创建评论
    const newComment = await prisma.comment.create({
      data: {
        authorId: userId,
        postId: validatedData.postId,
        lexicalState: validatedData.lexicalState as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        contentHtml: validatedData.contentHtml,
        content: validatedData.content,
        parentId: validatedData.parentId,
        replyToUserId: validatedData.replyToUserId,
        images:
          validatedData.imageUrls && validatedData.imageUrls.length > 0
            ? {
                create: validatedData.imageUrls.map((url) => ({
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
        replyToUser: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // 重新验证相关页面
    revalidatePath('/');

    return {
      ...newComment,
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
    } as CommentWithDetails;
  } catch (error) {
    logError('createComment', error, 'Failed to create comment');

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('创建评论失败，请重试');
  }
}
