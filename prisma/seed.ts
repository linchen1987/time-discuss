import { PrismaClient } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      name: '管理员',
      hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      email: 'user1@example.com',
      name: '用户一',
      hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'user2' },
    update: {},
    create: {
      username: 'user2',
      email: 'user2@example.com',
      name: '用户二',
      hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    },
  });

  console.log('用户创建完成:', { admin, user1, user2 });

  // 创建测试帖子
  const post1 = await prisma.post.create({
    data: {
      authorId: admin.id,
      lexicalState: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '欢迎来到朋友之家！这是我们的第一条帖子。',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      contentHtml: '<p>欢迎来到朋友之家！这是我们的第一条帖子。</p>',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: user1.id,
      lexicalState: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '今天天气真不错，适合出去走走！',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      contentHtml: '<p>今天天气真不错，适合出去走走！</p>',
    },
  });

  console.log('帖子创建完成:', { post1, post2 });

  // 创建测试评论
  const comment1 = await prisma.comment.create({
    data: {
      content: '欢迎欢迎！期待更多精彩内容！',
      authorId: user1.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: '确实是个好天气！',
      authorId: user2.id,
      postId: post2.id,
    },
  });

  console.log('评论创建完成:', { comment1, comment2 });

  // 创建测试点赞
  const like1 = await prisma.like.create({
    data: {
      userId: user1.id,
      postId: post1.id,
    },
  });

  const like2 = await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  const like3 = await prisma.like.create({
    data: {
      userId: admin.id,
      postId: post2.id,
    },
  });

  console.log('点赞创建完成:', { like1, like2, like3 });

  // 创建测试通知
  const notification1 = await prisma.notification.create({
    data: {
      recipientId: admin.id,
      actorId: user1.id,
      type: 'NEW_COMMENT',
      postId: post1.id,
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      recipientId: admin.id,
      actorId: user2.id,
      type: 'NEW_LIKE',
      postId: post1.id,
    },
  });

  console.log('通知创建完成:', { notification1, notification2 });

  console.log('种子数据创建完成！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
