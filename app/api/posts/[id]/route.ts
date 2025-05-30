import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { postOperations } from '@/lib/db-utils';

interface RouteParams {
  params: {
    id: string;
  };
}

interface SessionWithUser {
  user?: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用类型断言来处理session
    const session = (await getServerSession(authOptions)) as SessionWithUser | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id: postId } = params;

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
