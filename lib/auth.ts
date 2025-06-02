// NextAuth.js configuration
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { userValidation } from './validations';

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
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error('Missing credentials');
            return null;
          }

          // 验证输入格式
          const result = userValidation.login.safeParse({
            identifier: credentials.username,
            password: credentials.password,
          });

          if (!result.success) {
            console.error('Validation failed:', result.error);
            return null;
          }

          // 查找用户
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
            },
          });

          if (!user || !user.hashedPassword) {
            console.error('User not found or no password');
            return null;
          }

          // 验证密码
          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (!isPasswordValid) {
            console.error('Invalid password');
            return null;
          }

          console.error('Login successful for user:', user.username);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    /**
     * JWT 回调函数
     * @param {Object} params - 参数对象
     * @param {import('next-auth/jwt').JWT} params.token - JWT token 对象
     * @param {Object} [params.user] - 用户对象（仅在登录时存在）
     * @param {string} [params.trigger] - 触发类型（如 'update'）
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
      try {
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
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    /**
     * Session 回调函数
     * @param {Object} params - 参数对象
     * @param {import('next-auth').Session} params.session - Session 对象
     * @param {import('next-auth/jwt').JWT} params.token - JWT token 对象
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (token && session.user) {
          session.user.id = token.sub as string;
          session.user.username = token.username;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.avatarUrl = token.avatarUrl;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
