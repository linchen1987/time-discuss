import { NextResponse } from 'next/server';
import { postOperations } from '@/lib/db-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 20); // 最大20条

    const posts = await postOperations.getPostsWithDetails({
      cursor,
      limit,
    });

    // 判断是否还有更多数据
    const hasMore = posts.length === limit;
    const nextCursor = hasMore ? posts[posts.length - 1]?.id : null;

    return NextResponse.json({
      data: posts,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    // 返回具体的错误信息而不是通用消息
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Database query failed',
          message: error.message,
          type: error.constructor.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Unknown error occurred',
        message: String(error),
      },
      { status: 500 }
    );
  }
}
