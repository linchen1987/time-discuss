import { NextResponse } from 'next/server';
import { postOperations } from '@/lib/db-utils';

export async function GET() {
  try {
    const posts = await postOperations.getPostsWithDetails();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
  }
}
