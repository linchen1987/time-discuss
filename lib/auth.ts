// NextAuth.js configuration
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { userValidation } from './validations';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // 验证输入格式
        const result = userValidation.login.safeParse({
          identifier: credentials.username,
          password: credentials.password,
        });

        if (!result.success) {
          return null;
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: string }) {
      if (user) {
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.avatarUrl = user.avatarUrl;
      }

      // 当触发更新时，从数据库重新获取最新用户信息
      if (trigger === 'update' && token.sub) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        });

        if (updatedUser) {
          token.username = updatedUser.username;
          token.email = updatedUser.email;
          token.name = updatedUser.name;
          token.avatarUrl = updatedUser.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
