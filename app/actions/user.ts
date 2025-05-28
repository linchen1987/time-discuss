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
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: '更新失败，请重试' };
  }
}
