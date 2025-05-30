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

### 2.1 现有Comment表扩展

```sql
-- 扩展现有Comment表，支持富文本和二层回复
model Comment {
  id            String   @id @default(cuid())
  authorId      String
  author        User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  postId        String
  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  -- 富文本支持（与Post保持一致）
  lexicalState  Json?    // Lexical编辑器状态
  contentHtml   String?  @db.Text // HTML备份，用于快速展示
  content       String   @db.Text // 纯文本备份，用于搜索和通知
  
  -- 二层回复功能：评论(parentId=null) -> 回复(parentId!=null)
  parentId      String?  // 父评论ID，只支持一层回复
  parent        Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[] @relation("CommentReplies")
  replyToUserId String?  // 回复的目标用户ID（用于通知和显示）
  replyToUser   User?    @relation("CommentReplyTo", fields: [replyToUserId], references: [id])
  
  -- 时间戳
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  -- 关联关系
  images        CommentImage[]
  likes         CommentLike[]

  @@map("comments")
}
```

#### 二层回复结构说明：
- **顶级评论**: `parentId = null`，可以包含图片和富文本
- **回复评论**: `parentId != null`，回复某个顶级评论，建议仅支持文本
- **业务约束**: 在应用层限制回复的回复（即三层嵌套），保持界面简洁

### 2.2 新增CommentImage表

```sql
-- 评论图片表
model CommentImage {
  id         String   @id @default(cuid())
  url        String   // 图片URL
  altText    String?  // 图片描述
  commentId  String
  comment    Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  uploadedAt DateTime @default(now())

  @@map("comment_images")
}
```

### 2.3 新增CommentLike表

```sql
-- 评论点赞表
model CommentLike {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  commentId String
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, commentId]) // 每个用户只能给同一评论点赞一次
  @@map("comment_likes")
}
```

### 2.4 扩展User表关联

```sql
-- 在User表中新增关联关系
model User {
  // ... 现有字段
  
  // 新增评论相关关联
  commentLikes     CommentLike[]
  repliedComments  Comment[]     @relation("CommentReplyTo")
  
  // ... 其他字段
}
```

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
│       └── CommentReplies (回复列表)
│           └── CommentItem (递归嵌套)
```

### 4.2 核心组件设计

#### 4.2.1 CommentForm组件

```typescript
// components/comments/CommentForm.tsx
interface CommentFormProps {
  postId: string;
  parentId?: string; // 回复时的父评论ID
  replyToUser?: {
    id: string;
    name: string;
  }; // 回复的目标用户
  onCommentCreated?: (comment: CommentWithDetails) => void;
  onCancel?: () => void; // 回复时可取消
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  replyToUser,
  onCommentCreated,
  onCancel,
  placeholder = "写下你的想法...",
  autoFocus = false
}: CommentFormProps) {
  // 复用RichTextEditor逻辑
  // 提交时调用createComment Server Action
}
```

#### 4.2.2 CommentItem组件

```typescript
// components/comments/CommentItem.tsx
interface CommentItemProps {
  comment: CommentWithDetails;
  level?: number; // 嵌套层级，用于控制缩进
  maxLevel?: number; // 最大嵌套层级
  onCommentUpdated?: (comment: CommentWithDetails) => void;
  onCommentDeleted?: (commentId: string) => void;
  onReplyCreated?: (comment: CommentWithDetails) => void;
}

export function CommentItem({
  comment,
  level = 0,
  maxLevel = 3,
  onCommentUpdated,
  onCommentDeleted,
  onReplyCreated
}: CommentItemProps) {
  // 类似PostCard的设计
  // 支持编辑、删除、点赞、回复功能
  // 递归渲染回复
}
```

#### 4.2.3 CommentList组件

```typescript
// components/comments/CommentList.tsx
interface CommentListProps {
  postId: string;
  comments: CommentWithDetails[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function CommentList({
  postId,
  comments,
  loading,
  onLoadMore,
  hasMore
}: CommentListProps) {
  // 渲染评论列表
  // 支持分页加载
  // 处理评论更新和删除
}
```

## 5. 编辑器复用设计

### 5.1 RichTextEditor增强

```typescript
// components/editor/RichTextEditor.tsx 增强版
interface RichTextEditorProps {
  // ... 现有props
  
  // 新增评论相关props
  mode?: 'post' | 'comment' | 'reply'; // 使用模式
  replyToUser?: {
    id: string;
    name: string;
  }; // 回复用户信息
  maxHeight?: string; // 评论模式下限制高度
  compact?: boolean; // 紧凑模式，减少工具栏
}
```

### 5.2 编辑器配置差异

```typescript
// 不同模式下的编辑器配置
const editorConfigs = {
  post: {
    toolbar: 'full', // 完整工具栏
    placeholder: '有什么新鲜事？',
    maxHeight: 'auto',
    showImageUpload: true,
    showSubmitButton: true
  },
  comment: {
    toolbar: 'minimal', // 简化工具栏
    placeholder: '写下你的想法...',
    maxHeight: '200px',
    showImageUpload: true,
    showSubmitButton: true
  },
  reply: {
    toolbar: 'basic', // 基础工具栏
    placeholder: '回复 @username...',
    maxHeight: '150px',
    showImageUpload: false, // 回复暂不支持图片
    showSubmitButton: true
  }
}
```

## 6. 数据类型定义

### 6.1 TypeScript类型

```typescript
// lib/types.ts

interface CommentWithDetails {
  id: string;
  authorId: string;
  postId: string;
  lexicalState: Record<string, unknown> | null;
  contentHtml: string | null;
  content: string;
  parentId: string | null;
  replyToUserId: string | null;
  createdAt: string;
  updatedAt: string;
  
  // 关联数据
  author: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  replyToUser?: {
    id: string;
    name: string | null;
  };
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
  likes: {
    id: string;
    userId: string;
  }[];
  replies?: CommentWithDetails[]; // 可选的回复列表
  
  // 计算字段
  _count: {
    likes: number;
    replies: number;
  };
}

interface CommentFormData {
  lexicalState: Record<string, unknown> | null;
  contentHtml: string;
  content: string;
  imageUrls: string[];
  parentId?: string;
  replyToUserId?: string;
}
```

## 7. UI/UX设计要点

### 7.1 视觉层次

```css
/* 评论层级缩进 */
.comment-level-0 { margin-left: 0; }
.comment-level-1 { margin-left: 2rem; }
.comment-level-2 { margin-left: 4rem; }
.comment-level-3 { margin-left: 6rem; }
.comment-level-max { margin-left: 6rem; } /* 超过3层不再缩进 */

/* 回复指示线 */
.comment-reply-line {
  border-left: 2px solid var(--border);
  padding-left: 1rem;
}
```

### 7.2 交互状态

- **编辑状态**: 显示编辑器，隐藏原内容
- **回复状态**: 在评论下方显示回复表单
- **加载状态**: 提交、更新、删除时的loading状态
- **错误状态**: 操作失败时的错误提示

### 7.3 响应式设计

- 移动端减少缩进层级
- 小屏幕下简化工具栏
- 触摸友好的按钮尺寸

## 8. 性能优化策略

### 8.1 数据加载

```typescript
// 分页加载策略
const COMMENTS_PER_PAGE = 20;
const REPLIES_PER_COMMENT = 5; // 每个评论默认显示的回复数

// 懒加载回复
const loadMoreReplies = async (commentId: string, page: number) => {
  // 加载更多回复
};
```

### 8.2 缓存策略

- 使用SWR/TanStack Query缓存评论数据
- 乐观更新：点赞、创建评论时立即更新UI
- 增量更新：新评论添加到列表而不是重新获取

### 8.3 虚拟化（可选）

对于评论数量极多的情况，考虑使用虚拟滚动

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

### 10.2 内容审核

- XSS防护：HTML内容净化
- 内容长度限制
- 图片上传安全检查
- 敏感词过滤（可选）

## 11. 测试策略

### 11.1 单元测试

- 评论CRUD操作
- 点赞功能
- 回复逻辑
- 权限验证

### 11.2 集成测试

- API端点测试
- 数据库操作测试
- 通知发送测试

### 11.3 E2E测试

- 评论创建流程
- 编辑和删除流程
- 回复和点赞流程

## 12. 实施计划

### Phase 1: 基础评论功能
1. 数据库迁移
2. 基础API实现
3. CommentForm组件
4. CommentItem组件（基础版）

### Phase 2: 高级功能
1. 回复功能
2. 点赞功能
3. 编辑和删除
4. 通知集成

### Phase 3: 优化和完善
1. 性能优化
2. UI/UX改进
3. 测试完善
4. 错误处理

## 13. 后续扩展

### 13.1 可能的功能扩展
- 评论中的@提及功能
- 评论表情回应
- 评论举报功能
- 评论搜索
- 评论导出

### 13.2 技术改进
- 实时评论更新（WebSocket）
- 离线评论支持
- 评论内容的全文搜索
- 评论数据的缓存优化

---

这个设计方案提供了完整的评论功能实现路径，重点强调了代码复用、用户体验和可扩展性。实施时可以按照分阶段的方式逐步推进，确保每个阶段都有可用的功能交付。 