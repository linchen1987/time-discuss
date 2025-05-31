# 评论功能设计方案

本文档详细设计了"朋友之家"社交论坛的评论功能实现方案，包括评论创建、编辑、展示、点赞和回复等核心功能。

## 1. 功能概览

### 1.1 核心功能
- ✅ 评论创建：支持富文本内容和图片
- ✅ 评论编辑：作者可编辑自己的评论
- ✅ 评论点赞：用户可点赞/取消点赞评论
- ✅ 评论回复：支持二层回复结构（评论→回复）
- ✅ 评论删除：作者可删除自己的评论
- 🔄 评论展示：在帖子详情页展示（后续实现）

### 1.2 设计原则
- **组件复用**: 最大化复用现有的RichTextEditor和相关UI组件
- **数据一致性**: 保持与Post数据结构的一致性
- **性能优化**: 支持分页和懒加载
- **用户体验**: 提供流畅的编辑和交互体验
- **回复层级**: 采用二层回复结构（评论 + 回复），避免深度嵌套的复杂性

## 2. 数据库设计

### 2.5 扩展通知类型

```sql
-- 在Notification表中新增评论相关通知类型
-- type字段支持的新值：
-- "NEW_COMMENT" - 帖子收到新评论
-- "COMMENT_REPLY" - 评论收到回复
-- "COMMENT_LIKE" - 评论被点赞
-- "COMMENT_MENTION" - 评论中被提及（可选）

-- 新增commentId字段
model Notification {
  // ... 现有字段
  
  commentId String? // 关联的评论ID
  comment   Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
  
  // ... 其他字段
}
```

## 3. API设计

### 3.1 RESTful API端点

```typescript
// GET /api/posts/[postId]/comments
// 获取帖子的评论列表（支持分页和层级）
interface GetCommentsParams {
  postId: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

interface GetCommentsResponse {
  comments: CommentWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// POST /api/posts/[postId]/comments
// 创建新评论
interface CreateCommentRequest {
  lexicalState: Record<string, unknown>;
  contentHtml: string;
  content: string; // 纯文本内容
  imageUrls?: string[];
  parentId?: string; // 回复的父评论ID
  replyToUserId?: string; // 回复的目标用户ID
}

// PUT /api/comments/[commentId]
// 更新评论
interface UpdateCommentRequest {
  lexicalState: Record<string, unknown>;
  contentHtml: string;
  content: string;
  imageUrls?: string[];
}

// DELETE /api/comments/[commentId]
// 删除评论

// POST /api/comments/[commentId]/like
// 点赞/取消点赞评论
interface LikeCommentResponse {
  liked: boolean;
  likeCount: number;
}
```

### 3.2 Server Actions

```typescript
// app/actions/comments.ts

// 创建评论
async function createComment(
  postId: string,
  lexicalState: Record<string, unknown> | null,
  contentHtml: string,
  content: string,
  imageUrls: string[] = [],
  parentId?: string,
  replyToUserId?: string
): Promise<CommentWithDetails>

// 更新评论
async function updateComment(
  commentId: string,
  lexicalState: Record<string, unknown>,
  contentHtml: string,
  content: string,
  imageUrls: string[] = []
): Promise<CommentWithDetails>

// 删除评论
async function deleteComment(commentId: string): Promise<void>

// 点赞评论
async function toggleCommentLike(commentId: string): Promise<{
  liked: boolean;
  likeCount: number;
}>
```

## 4. 组件架构设计

### 4.1 组件层次结构

```
CommentSection (评论区域容器)
├── CommentForm (评论表单)
│   └── RichTextEditor (复用现有编辑器)
├── CommentList (评论列表)
│   └── CommentItem (单个评论)
│       ├── CommentContent (评论内容展示)
│       ├── CommentActions (评论操作按钮)
│       ├── CommentEditForm (编辑表单)
```

## 9. 通知集成

### 9.1 通知触发场景

```typescript
// 通知创建逻辑
const createNotification = async (type: string, data: any) => {
  switch (type) {
    case 'NEW_COMMENT':
      // 帖子作者收到评论通知
      break;
    case 'COMMENT_REPLY':
      // 评论作者收到回复通知
      break;
    case 'COMMENT_LIKE':
      // 评论作者收到点赞通知
      break;
  }
};
```

### 9.2 推送通知

集成到现有的PWA推送系统，支持浏览器通知

## 10. 安全考虑

### 10.1 权限控制

- 只有作者可以编辑/删除自己的评论
- 登录用户才能创建评论和点赞
- 防止恶意用户刷评论