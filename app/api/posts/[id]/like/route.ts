import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { likeOperations } from '@/lib/db-utils';

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

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // 切换点赞状态
    const result = await likeOperations.toggle(session.user.id, postId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: '操作失败，请重试' }, { status: 500 });
  }
}
