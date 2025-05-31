'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logError } from '@/lib/debug';

export async function createPost(lexicalState: Record<string, unknown> | null, contentHtml: string, imageUrls?: string[]) {
  try {
    const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
      throw new Error('请先登录');
    }

    // 确保 lexicalState 不为 null，提供默认值
    const validLexicalState = lexicalState || {
      root: {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    // 从内容中提取纯文本用于搜索
    const extractPlainText = (html: string): string => {
      return html.replace(/<[^>]*>/g, '').trim();
    };

    const plainTextContent = extractPlainText(contentHtml);

    // 验证内容
    if ((!plainTextContent || plainTextContent.trim().length === 0) && (!imageUrls || imageUrls.length === 0)) {
      throw new Error('帖子内容不能为空');
    }

    // 调用数据库操作
    const newPost = await import('@/lib/db-utils').then(({ postOperations }) =>
      postOperations.create({
        authorId: session.user.id!,
        lexicalState: validLexicalState,
        contentHtml,
        images: imageUrls?.map((url) => ({ url, altText: '' })),
      })
    );

    // 重新验证首页路径
    revalidatePath('/');

    return newPost;
  } catch (error) {
    logError('createPost', error, 'Failed to create post');
    throw error instanceof Error ? error : new Error('创建帖子失败，请重试');
  }
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  // 查找帖子并验证权限
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('帖子不存在');
  }

  if (post.authorId !== session.user.id) {
    throw new Error('无权限删除此帖子');
  }

  // 删除帖子
  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/');
}

// 处理图片上传
async function uploadImageToCloudinary(imageFile: File): Promise<string> {
  // 创建 FormData
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || '');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError('uploadImageToCloudinary', errorText, 'Cloudinary upload failed');
      throw new Error('图片上传失败');
    }

    const result: { secure_url: string } = await response.json();
    return result.secure_url;
  } catch (error) {
    logError('uploadImageToCloudinary', error, 'Image upload error');
    throw error;
  }
}

export async function likePost(postId: string) {
  try {
    const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
      throw new Error('请先登录');
    }

    // 使用动态导入来避免循环依赖
    const { postOperations } = await import('@/lib/db-utils');
    const result = await postOperations.toggleLike(postId, session.user.id!);

    // 重新验证相关路径
    revalidatePath('/');
    revalidatePath(`/posts/${postId}`);

    return result;
  } catch (error) {
    logError('likePost', error, 'Failed to like post');
    throw error instanceof Error ? error : new Error('点赞失败，请重试');
  }
}
