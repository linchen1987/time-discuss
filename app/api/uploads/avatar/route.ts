import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadValidation } from '@/lib/validations';
import fs from 'fs';
import path from 'path';

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

    // 这里应该上传到对象存储服务（如 Vercel Blob 或 Cloudflare R2）
    // 为了演示，我们先保存到项目根目录的uploads文件夹
    // 在实际项目中，你需要集成真实的对象存储服务

    // 示例：使用 Vercel Blob
    // import { put } from '@vercel/blob';
    // const blob = await put(fileName, file, {
    //   access: 'public',
    // });
    // const url = blob.url;

    // 临时方案：将文件保存到项目根目录的uploads文件夹
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 注意：在生产环境中不应该这样做，应该使用对象存储服务
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // 返回API路由URL而不是文件系统路径
    const url = `/api/uploads/avatars/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
