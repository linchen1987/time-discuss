// 通知类型枚举
export enum NotificationType {
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_LIKE = 'NEW_LIKE',
  MENTION = 'MENTION',
}

// 用户角色枚举
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// 帖子相关类型
export interface PostWithDetails {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  lexicalState: Record<string, unknown>;
  contentHtml: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      username: string | null;
      avatarUrl: string | null;
    };
    createdAt: Date;
  }[];
  likes: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      username: string | null;
    };
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

// 通知相关类型
export interface NotificationWithDetails {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  post?: {
    id: string;
    contentHtml: string | null;
  } | null;
  actor?: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  } | null;
}

// 用户资料类型
export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    total?: number;
  };
}
