// NextAuth.js type extensions

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      email?: string | null;
      name?: string | null;
      avatarUrl?: string | null;
    };
  }

  interface User {
    id: string;
    username?: string | null;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    username?: string | null;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  }
}
