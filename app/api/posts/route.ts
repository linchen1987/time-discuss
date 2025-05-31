import { NextResponse } from 'next/server';
import { postOperations } from '@/lib/db-utils';

export async function GET() {
  try {
    const posts = await postOperations.getPostsWithDetails();
    return NextResponse.json(posts);
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
