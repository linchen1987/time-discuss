import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export type Provider = 'local' | 'vercel';

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');
const PROVIDER = (process.env.AVATAR_PROVIDER as Provider) || 'local';

export async function uploadAvatar(file: File, fileName: string): Promise<string> {
  if (PROVIDER === 'vercel') {
    const rootDir = process.env.VERCEL_BLOB_ROOT_DIR || '';
    const blobPath = rootDir ? `${rootDir.replace(/\/$/, '')}/${fileName}` : fileName;
    const blob = await put(blobPath, file, { access: 'public' });
    return blob.url;
    // return `/api/uploads/avatars/${fileName}`;
  } else {
    // local
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!fs.existsSync(AVATAR_DIR)) {
      fs.mkdirSync(AVATAR_DIR, { recursive: true });
    }
    const filePath = path.join(AVATAR_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/api/uploads/avatars/${fileName}`;
  }
}

export async function getAvatarUrl(fileName: string): Promise<string> {
  if (PROVIDER === 'vercel') {
    // 这里假设和上传时一致，实际可根据 put 返回的 url 规则拼接
    return `https://${process.env.VERCEL_BLOB_BUCKET}.public.blob.vercel-storage.com/${fileName}`;
  } else {
    return `/api/uploads/avatars/${fileName}`;
  }
}
