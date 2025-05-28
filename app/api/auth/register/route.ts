import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { userValidation } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证输入数据
    const result = userValidation.register.safeParse(body);

    if (!result.success) {
      // 提取第一个错误信息作为主要错误
      const firstError = result.error.issues[0];
      const fieldName = firstError.path.join('.');
      const message = firstError.message;

      // 创建字段错误映射
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      return NextResponse.json(
        {
          error: message,
          field: fieldName,
          fieldErrors,
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { username, email, password, name } = result.data;

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json({ error: '邮箱已被使用' }, { status: 409 });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        hashedPassword,
        name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: '注册成功',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
