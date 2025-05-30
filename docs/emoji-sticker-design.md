# 表情包功能设计方案

## 概述

为 Time Discuss 应用添加表情包支持，包括标准 Emoji 和自定义表情包（如 doge、pepe 等）。参考 Telegram、Discord、微信的表情包体验，提供直观易用的表情包输入功能。

## 功能需求

### 核心功能
1. **标准 Emoji 支持**
   - 系统原生 Emoji 输入
   - 分类展示（笑脸、动物、食物、活动等）
   - 搜索功能
   - 最近使用记录

2. **自定义表情包支持**
   - 内置表情包集合（doge、pepe、思考等经典表情）
   - ~~用户上传自定义表情包~~
   - ~~表情包管理（收藏、删除）~~
   - ~~表情包包管理（分组）~~

3. **交互体验**
   - 表情包选择器弹窗
   - 快捷输入（:emoji_name: 格式）
   - 编辑器内预览
   - 键盘快捷键支持

4. **显示渲染**
   - 在编辑器中正确显示
   - 在帖子中正确渲染
   - 响应式大小调整
   - 动态加载优化

## 技术架构

### 前端架构

```
components/
├── emoji/
│   ├── EmojiPicker.tsx          # 表情包选择器主组件
│   ├── EmojiCategory.tsx        # 分类标签页
│   ├── EmojiGrid.tsx           # 表情包网格显示
│   ├── EmojiSearch.tsx         # 搜索组件
│   ├── StickerGrid.tsx         # 内置表情包网格显示
│   └── hooks/
│       ├── useEmojiData.ts     # 表情包数据管理
│       ├── useRecentEmojis.ts  # 最近使用记录（本地存储）
│       └── useEmojiSearch.ts   # 搜索逻辑
├── editor/
│   ├── plugins/
│   │   ├── EmojiPlugin.tsx     # Lexical 表情包插件
│   │   └── EmojiNode.tsx       # 自定义表情包节点
│   └── nodes/
│       └── StickerNode.tsx     # 自定义表情包节点
```

### 后端架构

```
app/
├── api/
│   └── emojis-stickers/
│       └── route.ts           # 获取全量表情包数据（emoji + stickers）
```

### 数据库设计

```sql
-- 表情包包（分组）
CREATE TABLE sticker_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 表情包
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  pack_id INTEGER REFERENCES sticker_packs(id),
  name VARCHAR(100) NOT NULL,        -- 表情包名称，如 "doge"
  keywords TEXT[],                   -- 搜索关键词
  image_url VARCHAR(500) NOT NULL,   -- 图片 URL
  animated BOOLEAN DEFAULT false,    -- 是否为动图
  size_kb INTEGER,                   -- 文件大小
  width INTEGER,                     -- 图片宽度
  height INTEGER,                    -- 图片高度
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_stickers_pack_id ON stickers(pack_id);
CREATE INDEX idx_stickers_keywords ON stickers USING GIN(keywords);
```

## 详细实现方案

### 1. 表情包数据管理

#### 系统内置表情包
```typescript
// lib/emoji/data.ts
export interface EmojiCategory {
  id: string
  name: string
  icon: string
  emojis: Emoji[]
}

export interface Emoji {
  id: string
  unicode: string
  name: string
  keywords: string[]
  category: string
}

export interface StickerPack {
  id: string
  name: string
  description: string
  icon: string
  stickers: Sticker[]
}

export interface Sticker {
  id: string
  name: string
  keywords: string[]
  imageUrl: string
  animated: boolean
  width: number
  height: number
}
```

#### 数据初始化
```typescript
// prisma/seed/stickers.ts
const systemStickerPacks = [
  {
    name: "经典表情",
    description: "互联网经典表情包",
    stickers: [
      {
        name: "doge",
        keywords: ["狗头", "doge", "柴犬"],
        imageUrl: "/stickers/classic/doge.png",
        animated: false
      },
      {
        name: "思考",
        keywords: ["思考", "想", "黑人问号"],
        imageUrl: "/stickers/classic/thinking.png",
        animated: false
      }
    ]
  }
]
```

### 2. Lexical 编辑器集成

#### 表情包节点定义
```typescript
// components/editor/nodes/EmojiNode.tsx
import { DecoratorNode, NodeKey, LexicalNode } from 'lexical'

export class EmojiNode extends DecoratorNode<JSX.Element> {
  __emoji: string
  
  static getType(): string {
    return 'emoji'
  }
  
  constructor(emoji: string, key?: NodeKey) {
    super(key)
    this.__emoji = emoji
  }
  
  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = 'emoji-node'
    return span
  }
  
  updateDOM(): false {
    return false
  }
  
  decorate(): JSX.Element {
    return <span className="emoji-node">{this.__emoji}</span>
  }
}

// components/editor/nodes/StickerNode.tsx
export class StickerNode extends DecoratorNode<JSX.Element> {
  __stickerId: string
  __stickerUrl: string
  __stickerName: string
  
  static getType(): string {
    return 'sticker'
  }
  
  decorate(): JSX.Element {
    return (
      <img 
        src={this.__stickerUrl}
        alt={this.__stickerName}
        className="inline-block max-w-16 max-h-16 align-middle"
        loading="lazy"
      />
    )
  }
}
```

#### 表情包插件
```typescript
// components/editor/plugins/EmojiPlugin.tsx
export function EmojiPlugin() {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    // 注册 :emoji_name: 格式的自动转换
    return editor.registerTextContentListener((textContent) => {
      const emojiMatches = textContent.match(/:[\w-]+:/g)
      if (emojiMatches) {
        editor.update(() => {
          // 转换为 EmojiNode 或 StickerNode
        })
      }
    })
  }, [editor])
  
  return null
}
```

### 3. 表情包选择器组件

#### 主选择器
```typescript
// components/emoji/EmojiPicker.tsx
interface EmojiPickerProps {
  onSelect: (emoji: Emoji | Sticker) => void
  onClose: () => void
  position: { x: number; y: number }
}

export function EmojiPicker({ onSelect, onClose, position }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<'emoji' | 'stickers'>('emoji')
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <div 
      className="fixed z-50 bg-white border rounded-lg shadow-lg w-80 h-96"
      style={{ left: position.x, top: position.y }}
    >
      <div className="p-3 border-b">
        <EmojiSearch 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索表情"
        />
      </div>
      
      <div className="flex border-b">
        <button 
          className={`flex-1 py-2 ${activeTab === 'emoji' ? 'bg-blue-50' : ''}`}
          onClick={() => setActiveTab('emoji')}
        >
          😀 Emoji
        </button>
        <button 
          className={`flex-1 py-2 ${activeTab === 'stickers' ? 'bg-blue-50' : ''}`}
          onClick={() => setActiveTab('stickers')}
        >
          🎭 表情包
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'emoji' ? (
          <EmojiGrid onSelect={onSelect} searchQuery={searchQuery} />
        ) : (
          <StickerGrid onSelect={onSelect} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
}
```

#### 网格显示
```typescript
// components/emoji/EmojiGrid.tsx
export function EmojiGrid({ onSelect, searchQuery }: EmojiGridProps) {
  const { data, loading, error } = useEmojiData()
  const recentEmojis = useRecentEmojis()
  const searchResults = useEmojiSearch(data, searchQuery)
  
  if (loading) return <div className="p-4 text-center">加载中...</div>
  if (error) return <div className="p-4 text-center text-red-500">加载失败</div>
  if (!data) return null
  
  // 如果有搜索结果，显示搜索结果
  if (searchQuery.trim()) {
    return (
      <div className="p-2">
        {searchResults.hasResults ? (
          <>
            {searchResults.emojis.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Emoji</h3>
                <div className="grid grid-cols-8 gap-1">
                  {searchResults.emojis.map(emoji => (
                    <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
                  ))}
                </div>
              </div>
            )}
            
            {searchResults.stickers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">表情包</h3>
                <div className="grid grid-cols-6 gap-2">
                  {searchResults.stickers.map(sticker => (
                    <StickerButton key={sticker.id} sticker={sticker} onSelect={onSelect} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            没有找到相关表情
          </div>
        )}
      </div>
    )
  }
  
  // 正常分类显示
  return (
    <div className="p-2">
      {/* 最近使用 */}
      {recentEmojis.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">最近使用</h3>
          <div className="grid grid-cols-8 gap-1">
            {recentEmojis.map(emoji => (
              <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
      
      {/* Emoji 分类显示 */}
      {data.emojis.map(category => (
        <div key={category.id} className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {category.icon} {category.name}
          </h3>
          <div className="grid grid-cols-8 gap-1">
            {category.emojis.map(emoji => (
              <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
      
      {/* Sticker 分组显示 */}
      {data.stickers.map(pack => (
        <div key={pack.id} className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {pack.name}
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {pack.stickers.map(sticker => (
              <StickerButton key={sticker.id} sticker={sticker} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 4. API 接口设计

#### 全量表情包数据 API
```typescript
// app/api/emojis-stickers/route.ts
export async function GET() {
  try {
    // 获取所有emoji分类和数据
    const emojiCategories = await getEmojiCategories()
    
    // 获取所有表情包数据（包含分组信息）
    const stickerPacks = await prisma.stickerPack.findMany({
      include: {
        stickers: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    return Response.json({
      emojis: emojiCategories,
      stickers: stickerPacks,
      timestamp: Date.now() // 用于缓存版本控制
    })
  } catch (error) {
    console.error('Failed to fetch emoji-sticker data:', error)
    return Response.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### 5. 前端数据管理和搜索

#### 数据管理 Hook
```typescript
// hooks/useEmojiData.ts
interface EmojiStickerData {
  emojis: EmojiCategory[]
  stickers: StickerPack[]
  timestamp: number
}

export function useEmojiData() {
  const [data, setData] = useState<EmojiStickerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadEmojiData()
  }, [])
  
  const loadEmojiData = async () => {
    try {
      setLoading(true)
      
      // 检查缓存
      const cached = getCachedEmojiData()
      if (cached && isCacheValid(cached.timestamp)) {
        setData(cached)
        setLoading(false)
        return
      }
      
      // 从API获取数据
      const response = await fetch('/api/emojis-stickers')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const newData = await response.json()
      
      // 缓存数据
      setCachedEmojiData(newData)
      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  return { data, loading, error, reload: loadEmojiData }
}

// 缓存管理
const CACHE_KEY = 'emoji-sticker-data'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

function getCachedEmojiData(): EmojiStickerData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

function setCachedEmojiData(data: EmojiStickerData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // 忽略存储错误
  }
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}
```

#### 前端搜索逻辑
```typescript
// hooks/useEmojiSearch.ts
export function useEmojiSearch(data: EmojiStickerData | null, query: string) {
  return useMemo(() => {
    if (!data || !query.trim()) {
      return {
        emojis: [],
        stickers: [],
        hasResults: false
      }
    }
    
    const normalizedQuery = query.toLowerCase().trim()
    
    // 搜索 Emoji
    const matchedEmojis: Emoji[] = []
    data.emojis.forEach(category => {
      category.emojis.forEach(emoji => {
        const matchesName = emoji.name.toLowerCase().includes(normalizedQuery)
        const matchesKeywords = emoji.keywords.some(keyword => 
          keyword.toLowerCase().includes(normalizedQuery)
        )
        
        if (matchesName || matchesKeywords) {
          matchedEmojis.push(emoji)
        }
      })
    })
    
    // 搜索 Stickers
    const matchedStickers: Sticker[] = []
    data.stickers.forEach(pack => {
      pack.stickers.forEach(sticker => {
        const matchesName = sticker.name.toLowerCase().includes(normalizedQuery)
        const matchesKeywords = sticker.keywords.some(keyword => 
          keyword.toLowerCase().includes(normalizedQuery)
        )
        
        if (matchesName || matchesKeywords) {
          matchedStickers.push(sticker)
        }
      })
    })
    
    return {
      emojis: matchedEmojis,
      stickers: matchedStickers,
      hasResults: matchedEmojis.length > 0 || matchedStickers.length > 0
    }
  }, [data, query])
}
```

#### 搜索组件
```typescript
// components/emoji/EmojiSearch.tsx
interface EmojiSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function EmojiSearch({ value, onChange, placeholder = "搜索表情" }: EmojiSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  
  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [inputValue, onChange])
  
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue('')
            onChange('')
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  )
}
```

#### 网格显示组件更新
```typescript
// components/emoji/EmojiGrid.tsx
export function EmojiGrid({ onSelect, searchQuery }: EmojiGridProps) {
  const { data, loading, error } = useEmojiData()
  const recentEmojis = useRecentEmojis()
  const searchResults = useEmojiSearch(data, searchQuery)
  
  if (loading) return <div className="p-4 text-center">加载中...</div>
  if (error) return <div className="p-4 text-center text-red-500">加载失败</div>
  if (!data) return null
  
  // 如果有搜索结果，显示搜索结果
  if (searchQuery.trim()) {
    return (
      <div className="p-2">
        {searchResults.hasResults ? (
          <>
            {searchResults.emojis.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Emoji</h3>
                <div className="grid grid-cols-8 gap-1">
                  {searchResults.emojis.map(emoji => (
                    <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
                  ))}
                </div>
              </div>
            )}
            
            {searchResults.stickers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">表情包</h3>
                <div className="grid grid-cols-6 gap-2">
                  {searchResults.stickers.map(sticker => (
                    <StickerButton key={sticker.id} sticker={sticker} onSelect={onSelect} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            没有找到相关表情
          </div>
        )}
      </div>
    )
  }
  
  // 正常分类显示
  return (
    <div className="p-2">
      {/* 最近使用 */}
      {recentEmojis.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">最近使用</h3>
          <div className="grid grid-cols-8 gap-1">
            {recentEmojis.map(emoji => (
              <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
      
      {/* Emoji 分类显示 */}
      {data.emojis.map(category => (
        <div key={category.id} className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {category.icon} {category.name}
          </h3>
          <div className="grid grid-cols-8 gap-1">
            {category.emojis.map(emoji => (
              <EmojiButton key={emoji.id} emoji={emoji} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
      
      {/* Sticker 分组显示 */}
      {data.stickers.map(pack => (
        <div key={pack.id} className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {pack.name}
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {pack.stickers.map(sticker => (
              <StickerButton key={sticker.id} sticker={sticker} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 6. 用户偏好管理

#### 最近使用记录（本地存储）
```typescript
// lib/emoji/recent.ts
export class RecentEmojiManager {
  private static readonly STORAGE_KEY = 'recent-emojis'
  private static readonly MAX_RECENT = 24
  
  static getRecentEmojis(): (Emoji | Sticker)[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
  
  static addRecentEmoji(emoji: Emoji | Sticker) {
    const recent = this.getRecentEmojis()
    const filtered = recent.filter(e => e.id !== emoji.id)
    const updated = [emoji, ...filtered].slice(0, this.MAX_RECENT)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
  }
  
  static clearRecentEmojis() {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// hooks/useRecentEmojis.ts
export function useRecentEmojis() {
  const [recentEmojis, setRecentEmojis] = useState<(Emoji | Sticker)[]>([])
  
  useEffect(() => {
    setRecentEmojis(RecentEmojiManager.getRecentEmojis())
  }, [])
  
  const addRecentEmoji = useCallback((emoji: Emoji | Sticker) => {
    RecentEmojiManager.addRecentEmoji(emoji)
    setRecentEmojis(RecentEmojiManager.getRecentEmojis())
  }, [])
  
  return {
    recentEmojis,
    addRecentEmoji,
    clearRecentEmojis: () => {
      RecentEmojiManager.clearRecentEmojis()
      setRecentEmojis([])
    }
  }
}
```

### 7. 性能优化

#### 图片懒加载
```typescript
// components/emoji/LazySticker.tsx
export function LazySticker({ sticker, onSelect }: LazyStickerProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect() // 一次性观察
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={ref} className="w-8 h-8 flex items-center justify-center">
      {inView && (
        <img
          src={sticker.imageUrl}
          alt={sticker.name}
          className="max-w-full max-h-full cursor-pointer hover:scale-110 transition-transform"
          onLoad={() => setLoaded(true)}
          onClick={() => onSelect(sticker)}
          loading="lazy"
        />
      )}
      {!loaded && inView && (
        <div className="w-6 h-6 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  )
}
```

#### 数据缓存
```typescript
// lib/emoji/cache.ts
class EmojiDataCache {
  private cache = new Map<string, any>()
  private readonly TTL = 5 * 60 * 1000 // 5分钟
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data
    }
    
    const data = await fetcher()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}

export const emojiCache = new EmojiDataCache()
```

### 8. 移动端优化

#### 触摸友好的交互
```typescript
// components/emoji/MobileEmojiPicker.tsx
export function MobileEmojiPicker() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t">
      <div className="h-80 flex flex-col">
        {/* 搜索栏 */}
        <div className="p-3 border-b">
          <input 
            type="text"
            placeholder="搜索表情"
            className="w-full p-2 border rounded-lg text-lg"
          />
        </div>
        
        {/* 标签页 */}
        <div className="flex border-b">
          {categories.map(category => (
            <button
              key={category.id}
              className="flex-1 py-3 text-2xl"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon}
            </button>
          ))}
        </div>
        
        {/* 表情网格 - 更大的点击区域 */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map(emoji => (
              <button
                key={emoji.id}
                className="aspect-square flex items-center justify-center text-xl p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
                onClick={() => onSelect(emoji)}
              >
                {emoji.unicode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 部署和维护

### 数据迁移
```sql
-- 创建表情包相关表
-- 插入系统默认表情包
-- 创建索引

-- 示例数据插入
INSERT INTO sticker_packs (name, description, icon_url) VALUES
('经典表情', '互联网经典表情包', '/stickers/classic/icon.png'),
('动物表情', '可爱动物表情', '/stickers/animals/icon.png'),
('搞怪表情', '搞笑趣味表情', '/stickers/funny/icon.png');

INSERT INTO stickers (pack_id, name, keywords, image_url, animated, width, height) VALUES
(1, 'doge', ARRAY['狗头', 'doge', '柴犬'], '/stickers/classic/doge.png', false, 128, 128),
(1, 'thinking', ARRAY['思考', '想', '黑人问号'], '/stickers/classic/thinking.png', false, 128, 128),
(1, 'pepe', ARRAY['佩佩', 'pepe', '青蛙'], '/stickers/classic/pepe.png', false, 128, 128);
```

### 静态资源管理
- 表情包图片存储在 `public/stickers/` 目录
- 按分组组织文件结构：`public/stickers/{pack_name}/`
- 图片格式：PNG、JPEG、WebP
- 建议尺寸：128x128px，文件大小 < 50KB

## 表情包资源存储方案

### 存储位置选择

#### 方案一：项目内存储（推荐用于MVP阶段）

**文件结构：**
```
public/stickers/
├── classic/
│   ├── doge.webp
│   ├── doge.png
│   └── thinking.webp
├── animals/
│   └── cat.webp
└── emoji-data.json    # 元数据文件
```

**配置示例：**
```typescript
// lib/config/assets.ts
const ASSET_CONFIG = {
  // 开发环境：本地文件
  development: {
    baseUrl: '',
    stickerPath: '/stickers'
  },
  // 生产环境：可配置为CDN或本地
  production: {
    baseUrl: process.env.CDN_BASE_URL || '',
    stickerPath: '/stickers'
  }
}

export const getAssetUrl = (path: string) => {
  const config = ASSET_CONFIG[process.env.NODE_ENV as keyof typeof ASSET_CONFIG]
  return `${config.baseUrl}${config.stickerPath}${path}`
}
```

**优点：**
- 快速上线，无需配置云服务
- 开发调试方便
- 部署简单，一键发布
- 适合MVP验证阶段

**缺点：**
- 增加项目体积约2-3MB
- Git仓库会变大

#### 方案二：云存储 + CDN（推荐用于生产优化）

**架构设计：**
```typescript
// lib/config/storage.ts
export const STORAGE_CONFIG = {
  provider: 'vercel-blob', // 或 's3', 'cloudflare-r2'
  bucket: 'time-discuss-assets',
  region: 'auto',
  cdnDomain: 'assets.timediscuss.com',
  
  // 图片处理参数
  imageTransform: {
    webp: { quality: 80 },
    png: { quality: 90 },
    resize: { width: 128, height: 128 }
  }
}

// 获取优化后的图片URL
export const getOptimizedImageUrl = (
  imagePath: string, 
  options: { format?: 'webp' | 'png'; size?: number } = {}
) => {
  const { format = 'webp', size = 128 } = options
  const baseUrl = STORAGE_CONFIG.cdnDomain
  
  // 支持动态格式转换和尺寸调整
  return `https://${baseUrl}/${imagePath}?format=${format}&w=${size}&h=${size}`
}
```

**部署脚本：**
```typescript
// scripts/upload-stickers.ts
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

async function uploadStickers() {
  const stickersDir = './assets/stickers'
  const files = await fs.promises.readdir(stickersDir, { recursive: true })
  
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.webp')) {
      const filePath = path.join(stickersDir, file)
      const fileBuffer = await fs.promises.readFile(filePath)
      
      const { url } = await put(`stickers/${file}`, fileBuffer, {
        access: 'public',
        contentType: file.endsWith('.webp') ? 'image/webp' : 'image/png'
      })
      
      console.log(`Uploaded: ${file} -> ${url}`)
    }
  }
}

// 更新数据库中的图片URL
async function updateStickerUrls() {
  // 批量更新数据库中的 image_url 字段
}
```

### 推荐的渐进式方案

#### 阶段一：项目内存储（快速启动）
```typescript
// 当前阶段：简单直接
const stickerBaseUrl = '/stickers'

// 数据库种子数据
const stickers = [
  {
    name: 'doge',
    imageUrl: '/stickers/classic/doge.webp',
    keywords: ['狗头', 'doge']
  }
]
```

#### 阶段二：云存储迁移（性能优化）
```typescript
// 迁移后：云存储 + CDN
const stickerBaseUrl = 'https://assets.timediscuss.com/stickers'

// 保持API兼容性
const stickers = [
  {
    name: 'doge',
    imageUrl: 'https://assets.timediscuss.com/stickers/classic/doge.webp',
    keywords: ['狗头', 'doge']
  }
]
```

#### 阶段三：智能优化（高级特性）
```typescript
// components/emoji/SmartImage.tsx
interface SmartImageProps {
  src: string
  alt: string
  size?: number
}

export function SmartImage({ src, alt, size = 32 }: SmartImageProps) {
  const [format, setFormat] = useState<'webp' | 'png'>('webp')
  const [loading, setLoading] = useState(true)
  
  // 检测浏览器支持
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('webp') !== -1
    setFormat(supportsWebP ? 'webp' : 'png')
  }, [])
  
  // 根据设备像素比调整尺寸
  const actualSize = Math.ceil(size * (window.devicePixelRatio || 1))
  
  // 构建优化的图片URL
  const optimizedSrc = `${src}?format=${format}&w=${actualSize}&h=${actualSize}`
  
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onLoad={() => setLoading(false)}
      onError={() => {
        // 降级到PNG格式
        if (format === 'webp') {
          setFormat('png')
        }
      }}
      className={`transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}
    />
  )
}
```

### 成本分析

#### 项目内存储成本
```
构建包大小增加：~3MB
Git LFS 费用：$0（小于100MB）
CDN 流量：包含在 Vercel/Netlify 套餐中
总成本：$0
```

#### 云存储成本（以 Vercel Blob 为例）
```
存储：100张图片 × 30KB = 3MB
月存储费用：$0.15/GB × 0.003GB = $0.0005
月流量费用：假设1万次访问 × 30KB = 300MB = $0.12/GB × 0.3GB = $0.036
总月成本：~$0.04（几乎忽略不计）
```

### 迁移策略

```typescript
// lib/assets/migration.ts
export class AssetMigration {
  static async migrateToCloud() {
    // 1. 上传本地文件到云存储
    // 2. 更新数据库URL
    // 3. 验证所有图片可访问
    // 4. 清理本地文件
  }
  
  static async rollbackToLocal() {
    // 回滚机制，确保可以快速恢复
  }
}

// 环境变量控制
const USE_CLOUD_STORAGE = process.env.USE_CLOUD_STORAGE === 'true'

export const getImageUrl = (path: string) => {
  if (USE_CLOUD_STORAGE) {
    return `${process.env.CDN_BASE_URL}${path}`
  }
  return path // 本地路径
}
```

### 最终建议

1. **立即开始**：使用项目内存储，快速上线MVP
2. **监控指标**：观察加载性能和用户反馈
3. **适时迁移**：当图片数量>100或性能成为瓶颈时迁移到云存储
4. **保持灵活**：设计时考虑迁移路径，避免重构

这种渐进式方案既能快速启动，又能平滑升级到最优解决方案。

## 总结

简化后的方案专注于核心功能：

1. **内置表情包系统**：预设高质量的表情包集合
2. **优秀的用户体验**：直观的选择器、快捷输入、搜索功能
3. **良好的性能**：懒加载、本地缓存、静态资源优化
4. **简单的维护**：无用户上传，减少内容管理复杂度
5. **移动端友好**：响应式设计、触摸优化

通过这个简化方案，可以快速实现表情包功能，为用户提供丰富的表达方式，同时保持系统的简洁和可维护性。 