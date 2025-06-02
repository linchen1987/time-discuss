import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 使用 session 中的用户 ID
    const userId = session.user.id;

    if (!userId) {
      console.log('API: 无法获取用户ID'); // 调试日志
      return NextResponse.json({ error: '无法获取用户信息' }, { status: 400 });
    }

    // 获取用户完整信息，包括统计数据
    console.log('API: 开始查询数据库'); // 调试日志
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });

    console.log('API: 查询到的用户数据:', user); // 调试日志

    if (!user) {
      console.log('API: 用户不存在'); // 调试日志
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    console.log('API: 成功返回用户数据'); // 调试日志
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
