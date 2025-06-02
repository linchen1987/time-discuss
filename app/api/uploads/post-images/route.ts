import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadValidation } from '@/lib/validations';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 使用类型断言
    const user = session.user as { id: string };

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '请选择图片文件' }, { status: 400 });
    }

    if (files.length > 9) {
      return NextResponse.json({ error: '最多上传9张图片' }, { status: 400 });
    }

    const userId = user.id;

    const uploadPromises = files.map(async (file, index) => {
      // 验证每个文件
      const validation = uploadValidation.image.safeParse({ file });
      if (!validation.success) {
        throw new Error(`图片 ${index + 1}: ${validation.error.errors[0]?.message || '文件格式不支持'}`);
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `post-${userId}-${timestamp}-${index}.${fileExtension}`;

      // 使用 Vercel Blob 上传
      const provider = process.env.AVATAR_PROVIDER || 'local';

      if (provider === 'vercel') {
        const rootDir = process.env.BLOB_ROOT_DIR || '';
        const blobPath = rootDir ? `${rootDir.replace(/\/$/, '')}/posts/${fileName}` : `posts/${fileName}`;
        const blob = await put(blobPath, file, { access: 'public' });
        return blob.url;
      } else {
        // 本地存储逻辑（可选实现）
        throw new Error('本地存储暂未实现');
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      return NextResponse.json({ urls });
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        {
          error: uploadError instanceof Error ? uploadError.message : '图片上传失败',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Post image upload error:', error);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
