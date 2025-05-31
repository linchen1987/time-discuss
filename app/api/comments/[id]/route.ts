import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { commentOperations } from '@/lib/db-utils';
import { commentValidation } from '@/lib/validations';
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

// 更新评论
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { lexicalState, contentHtml, imageUrls } = body;

    // 验证数据
    const validatedData = commentValidation.update.parse({
      lexicalState,
      contentHtml,
      content: extractTextFromLexical(lexicalState),
      imageUrls,
    });

    // 构建图片数据
    const images =
      validatedData.imageUrls && Array.isArray(validatedData.imageUrls) ? validatedData.imageUrls.map((url: string) => ({ url, altText: '' })) : undefined;

    // 更新评论（只有作者可以编辑）
    const updatedComment = await commentOperations.update(commentId, session.user.id, {
      lexicalState: validatedData.lexicalState,
      contentHtml: validatedData.contentHtml,
      content: validatedData.content,
      images,
    });

    // 转换日期为字符串以匹配CommentWithDetails类型
    const commentWithStringDates = {
      ...updatedComment,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, comment: commentWithStringDates });
  } catch (error) {
    logError('Comment Update API', error, 'Update comment failed');

    if (error instanceof Error && error.message === 'Comment not found or unauthorized') {
      return NextResponse.json({ error: '评论不存在或无权编辑' }, { status: 403 });
    }

    return NextResponse.json({ error: '更新失败，请重试' }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // 删除评论（只有作者可以删除）
    await commentOperations.delete(commentId, session.user.id);

    return NextResponse.json({ success: true, message: '评论已删除' });
  } catch (error) {
    logError('Comment Delete API', error, 'Delete comment failed');

    if (error instanceof Error && error.message === 'Comment not found or unauthorized') {
      return NextResponse.json({ error: '评论不存在或无权删除' }, { status: 403 });
    }

    return NextResponse.json({ error: '删除失败，请重试' }, { status: 500 });
  }
}

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
