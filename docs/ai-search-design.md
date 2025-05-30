# AI 搜索设计文档

## 需求分析

### AI 搜索的内容格式需求
- **纯文本**: 用于语义理解、向量化、大模型处理
- **Markdown**: 保留格式结构，便于AI理解层次关系
- **元数据**: 作者、时间、标签、提及等上下文信息

## 当前架构评估 ✅ 完全支持

### 数据源选择
```prisma
model Post {
  lexicalState Json        // 主要数据源 - 可转换为任何格式
  contentHtml  String?     // 备选数据源 - 可转纯文本
  // ...
}
```

### 内容转换能力

#### 1. Lexical State → 纯文本
```typescript
// 从 Lexical 状态提取纯文本
function extractPlainText(lexicalState: any): string {
  // 递归遍历 Lexical 节点，提取文本内容
  // 忽略格式，只保留文本
}
```

#### 2. Lexical State → Markdown  
```typescript
// 从 Lexical 状态转换为 Markdown
function convertToMarkdown(lexicalState: any): string {
  // 将 Lexical 节点转换为对应的 Markdown 格式：
  // - ParagraphNode → 段落
  // - HeadingNode → # ## ###
  // - ListNode → - * 1.
  // - LinkNode → [text](url)
  // - TextNode (bold) → **text**
  // - MentionNode → @username
  // - HashtagNode → #tag
}
```

#### 3. HTML → 纯文本（备选方案）
```typescript
// 从 contentHtml 提取纯文本
function htmlToPlainText(html: string): string {
  // 去除HTML标签，保留纯文本
}
```

## AI 搜索 API 设计

### 数据格式示例
```typescript
interface AISearchDocument {
  // 基础信息
  id: string
  type: 'post' | 'comment'
  
  // AI 处理用的内容
  plainText: string      // 纯文本内容
  markdown: string       // Markdown 格式
  
  // 元数据
  metadata: {
    author: {
      id: string
      name: string
      username: string
    }
    createdAt: string
    updatedAt: string
    tags: string[]       // 从 #hashtag 提取
    mentions: string[]   // 从 @username 提取
    imageCount: number
    linkCount: number
  }
  
  // 上下文信息
  context: {
    likesCount: number
    commentsCount: number
    engagementScore: number
  }
}
```

### API 端点设计
```typescript
// GET /api/ai/search/documents
// 返回适合AI处理的文档格式

export async function getAISearchDocuments(params: {
  limit?: number
  cursor?: string
  userId?: string
  includeComments?: boolean
}) {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      images: true,
      _count: { select: { likes: true, comments: true } }
    }
  })

  return posts.map(post => ({
    id: post.id,
    type: 'post',
    plainText: extractPlainText(post.lexicalState),
    markdown: convertToMarkdown(post.lexicalState),
    metadata: {
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username
      },
      createdAt: post.createdAt.toISOString(),
      tags: extractHashtags(post.lexicalState),
      mentions: extractMentions(post.lexicalState),
      imageCount: post.images.length
    },
    context: {
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      engagementScore: calculateEngagement(post)
    }
  }))
}
```

## 实现策略

### 第一阶段：基础转换器
```typescript
// lib/ai-content-converter.ts
export class AIContentConverter {
  // 从 Lexical 提取纯文本
  static toPlainText(lexicalState: any): string { }
  
  // 从 Lexical 转换为 Markdown
  static toMarkdown(lexicalState: any): string { }
  
  // 提取结构化信息
  static extractHashtags(lexicalState: any): string[] { }
  static extractMentions(lexicalState: any): string[] { }
  static extractLinks(lexicalState: any): string[] { }
}
```

### 第二阶段：搜索优化
```typescript
// 可选：为AI搜索添加专门的字段
model Post {
  // ... 现有字段
  
  // AI搜索优化字段（可选）
  searchText    String? // 预处理的搜索文本
  searchVector  Float[] // 向量化结果（如果使用向量搜索）
  searchMeta    Json?   // 搜索元数据缓存
}
```

### 第三阶段：高级功能
- **向量搜索**: 将内容向量化，支持语义搜索
- **实时更新**: 帖子更新时自动更新搜索数据
- **多模态**: 支持图片内容的AI分析

## 优势分析

### ✅ 当前设计的优势
1. **完全兼容**: 无需修改现有数据结构
2. **格式灵活**: 可转换为任何AI需要的格式
3. **信息完整**: 保留所有结构和元数据信息
4. **性能优化**: 可选择性缓存转换结果

### 🚀 扩展能力
1. **多格式支持**: 同时支持纯文本、Markdown、HTML
2. **增量更新**: 只转换变更的内容
3. **批量处理**: 支持大规模数据导出
4. **自定义格式**: 可为特定AI模型定制格式

## 结论

✅ **无需修改当前设计** - 现有架构完美支持AI搜索
✅ **只需添加转换器** - 实现 Lexical → Text/Markdown 转换
✅ **可选性能优化** - 根据需要添加缓存字段
✅ **完全向后兼容** - 不影响现有功能

当前的 `lexicalState` + `contentHtml` 设计已经为AI搜索提供了完美的数据基础。 