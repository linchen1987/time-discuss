import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadValidation } from '@/lib/validations';
import { uploadAvatar } from '@/lib/storage/avatarProvider';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // 验证文件
    const validation = uploadValidation.image.safeParse({ file });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0]?.message || '文件格式不支持' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar-${session.user.id}-${timestamp}.${fileExtension}`;

    // 使用 provider 上传头像
    const url = await uploadAvatar(file, fileName);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
