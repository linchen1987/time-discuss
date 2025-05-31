import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { postOperations } from '@/lib/db-utils';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/debug';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface SessionWithUser {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用类型断言来处理session
    const session = (await getServerSession(authOptions)) as SessionWithUser | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: '帖子ID无效' }, { status: 400 });
    }

    // 删除帖子（只有作者可以删除）
    await postOperations.delete(postId, session.user.id);

    return NextResponse.json({ success: true, message: '帖子已删除' });
  } catch (error) {
    console.error('Delete post error:', error);

    if (error instanceof Error && error.message === 'Post not found or unauthorized') {
      return NextResponse.json({ error: '帖子不存在或无权删除' }, { status: 403 });
    }

    return NextResponse.json({ error: '删除失败，请重试' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用类型断言来处理session
    const session = (await getServerSession(authOptions)) as SessionWithUser | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: '帖子ID无效' }, { status: 400 });
    }

    const body = await request.json();
    const { lexicalState, contentHtml, imageUrls } = body;

    if (!lexicalState || typeof lexicalState !== 'object') {
      return NextResponse.json({ error: '帖子内容格式无效' }, { status: 400 });
    }

    // 构建图片数据
    const images = imageUrls && Array.isArray(imageUrls) ? imageUrls.map((url: string) => ({ url, altText: '' })) : undefined;

    // 更新帖子（只有作者可以编辑）
    const updatedPost = await postOperations.update(postId, session.user.id, {
      lexicalState,
      contentHtml,
      images,
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);

    if (error instanceof Error && error.message === 'Post not found or unauthorized') {
      return NextResponse.json({ error: '帖子不存在或无权编辑' }, { status: 403 });
    }

    return NextResponse.json({ error: '更新失败，请重试' }, { status: 500 });
  }
}

// 获取帖子详情（包含评论）
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 获取帖子详情，包含完整的评论数据
    const post = await prisma.post.findUnique({
      where: { id },
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
        comments: {
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
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // 按时间正序排列，像聊天一样
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

    if (!post) {
      return Response.json({ error: '帖子不存在' }, { status: 404 });
    }

    return Response.json(post);
  } catch (error) {
    logError('GET /api/posts/[id]', error, 'Failed to fetch post details');
    return Response.json({ error: '获取帖子详情失败' }, { status: 500 });
  }
}
