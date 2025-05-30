# 帖子存储格式设计文档

## 当前状态分析

### 数据库设计 ✅
```prisma
model Post {
  lexicalState Json        // Lexical 编辑器状态
  contentHtml  String?     // HTML 格式内容  
  // ...其他字段
}
```

### 当前实现问题 ❌
1. **前端**: 使用 Textarea 而非 Lexical 编辑器
2. **存储**: 手动构造简单的 Lexical JSON
3. **显示**: 使用纯文本 contentHtml
4. **功能**: 不支持富文本、链接识别等

## 未来需求支持方案

### 高优先级需求
- ✅ **URL 自动识别**: Lexical `AutoLinkPlugin`
- ✅ **文字加粗**: Lexical 基础格式化功能

### 中优先级需求  
- ✅ **有序/无序列表**: Lexical `ListPlugin`
- ✅ **@ 提及用户**: 自定义 `MentionNode` + 插件
- ✅ **# 标签**: 自定义 `HashtagNode` + 插件
- ✅ **/ 指令菜单**: Lexical `SlashCommandPlugin`

### 搜索支持
- ✅ **全文搜索**: 从 lexicalState 提取纯文本建立索引
- ✅ **标签搜索**: 解析 # 标签建立标签表
- ✅ **用户搜索**: 解析 @ 提及建立关联

## 改进方案

### 1. 数据结构评估 ✅ 无需修改
当前 Prisma schema 已经设计得很好：
- `lexicalState` 支持所有富文本功能
- `contentHtml` 可用于搜索和 SEO
- `PostImage` 表已支持图片关联

### 2. 需要添加的新表（可选）
```prisma
// 标签表 - 用于标签管理和搜索
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  posts     PostTag[]
  createdAt DateTime @default(now())
}

model PostTag {
  id     String @id @default(cuid())
  postId String
  tagId  String
  post   Post   @relation(fields: [postId], references: [id])
  tag    Tag    @relation(fields: [tagId], references: [id])
  
  @@unique([postId, tagId])
}

// 提及表 - 用于 @ 功能和通知
model Mention {
  id           String @id @default(cuid())
  postId       String
  mentionedUserId String
  post         Post   @relation(fields: [postId], references: [id])
  mentionedUser User  @relation(fields: [mentionedUserId], references: [id])
  
  @@unique([postId, mentionedUserId])
}
```

### 3. 实现步骤

#### 第一阶段：基础 Lexical 集成
1. 安装 Lexical 插件依赖
2. 创建 `LexicalEditor` 组件替换 `Textarea`
3. 实现 URL 自动识别和文字格式化
4. 更新 `createPost` 处理真实的 Lexical 状态

#### 第二阶段：高级功能
1. 实现列表插件
2. 开发自定义 Mention 和 Hashtag 节点
3. 添加斜杠指令菜单
4. 构建内容解析器（提取标签、提及等）

#### 第三阶段：搜索功能
1. 实现内容到纯文本的转换
2. 建立全文搜索索引
3. 实现标签和用户搜索

### 4. 向后兼容策略
- 保持现有 API 不变
- 现有纯文本帖子可自动转换为 Lexical 格式
- 逐步迁移前端组件

## 技术实现细节

### Lexical 插件配置
```typescript
const plugins = [
  // 基础功能
  RichTextPlugin,
  HistoryPlugin,
  AutoFocusPlugin,
  
  // URL 识别
  AutoLinkPlugin,
  LinkPlugin,
  
  // 列表
  ListPlugin,
  
  // 自定义功能
  MentionPlugin,
  HashtagPlugin,
  SlashCommandPlugin,
]
```

### 内容转换流程
```
用户输入 → Lexical State → 解析提取 → 存储到数据库
                ↓
         生成 contentHtml + 提及 + 标签
```

## 结论

✅ **无需修改数据库设计** - 当前结构已完美支持所有需求
✅ **需要实现 Lexical 编辑器** - 替换当前的 Textarea
✅ **需要内容解析器** - 提取标签、提及等结构化数据
✅ **支持渐进式升级** - 可与现有系统兼容 