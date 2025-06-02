'use server';

import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { userValidation } from '@/lib/validations';

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: '请先登录' };
    }

    const name = formData.get('name') as string;
    const avatarUrl = formData.get('avatarUrl') as string;

    // 验证输入数据
    const validation = userValidation.updateProfile.safeParse({
      name: name || undefined,
      avatarUrl: avatarUrl || undefined,
    });

    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return {
        success: false,
        error: validation.error.errors[0]?.message || '输入数据无效',
      };
    }

    // 更新用户资料
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validation.data.name,
        avatarUrl: validation.data.avatarUrl,
      },
    });

    // 重新验证相关页面
    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: Error | any) {
    console.error('Update profile error:', error);

    // 在开发环境中显示详细错误信息
    if (process.env.NODE_ENV === 'development') {
      return { success: false, error: `更新失败，请重试: ${error?.message}` };
    }

    // 在生产环境中，根据错误类型提供合适的错误信息
    if (error?.code === 'P2002') {
      return { success: false, error: '用户名或邮箱已存在' };
    }

    if (error?.code === 'P2025') {
      return { success: false, error: '用户不存在' };
    }

    if (error?.message?.includes('database') || error?.message?.includes('connection')) {
      return { success: false, error: '数据库连接错误，请稍后重试' };
    }

    return { success: false, error: '更新失败，请重试' };
  }
}
