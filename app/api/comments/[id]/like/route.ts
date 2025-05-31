import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/debug';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SessionWithUser {
  user?: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用类型断言来处理session
    const session = (await getServerSession(authOptions)) as SessionWithUser | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id: commentId } = await params;

    if (!commentId) {
      return NextResponse.json({ error: '评论ID无效' }, { status: 400 });
    }

    // 检查评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    // 检查是否已经点赞
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      // 取消点赞
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // 添加点赞
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });
      liked = true;

      // 如果点赞的不是自己的评论，创建通知
      if (comment.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            recipientId: comment.authorId,
            actorId: session.user.id,
            type: 'COMMENT_LIKE',
            commentId,
          },
        });
      }
    }

    // 获取最新的点赞数
    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    return NextResponse.json({
      liked,
      likeCount,
    });
  } catch (error) {
    logError('Comment Like API', error, 'Like toggle failed');
    return NextResponse.json({ error: '操作失败，请重试' }, { status: 500 });
  }
}
