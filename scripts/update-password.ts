import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * 更新用户密码
 * @param username 用户名
 * @param password 明文密码
 * @returns Promise<{success: boolean, message: string}>
 */
export async function updatePassword(username: string, password: string) {
  try {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 更新用户密码
    await prisma.user.update({
      where: { username },
      data: {
        hashedPassword,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: '密码更新成功',
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: '服务器内部错误',
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error('用法: npm run update-password <username> <password>');
    process.exit(1);
  }

  const [username, password] = args;

  updatePassword(username, password)
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('执行失败:', error);
      process.exit(1);
    });
}
