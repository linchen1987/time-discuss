import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAvatarUrl } from '@/lib/storage/avatarProvider';

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;

    // 验证文件名格式，防止路径遍历攻击
    if (!filename || !/^avatar-[a-zA-Z0-9]+-\d+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
      return NextResponse.json({ error: '无效的文件名' }, { status: 400 });
    }

    const provider = process.env.AVATAR_PROVIDER || 'local';
    if (provider === 'vercel') {
      const url = await getAvatarUrl(filename);
      return NextResponse.redirect(url, 302);
    }

    // 本地读取逻辑
    const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);

    // 根据文件扩展名设置正确的Content-Type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // 默认

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }

    // 返回图片文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 缓存1年
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: '文件读取失败' }, { status: 500 });
  }
}
