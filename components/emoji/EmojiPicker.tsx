'use client'

import { useState, useRef, useEffect } from 'react'
import { useEmojiData, useEmojiSearch, useRecentEmojis } from '@/hooks/useEmojiData'
import type { Emoji } from '@/lib/emoji/data'

interface EmojiPickerProps {
    onSelect: (emoji: Emoji) => void
    onClose: () => void
    position?: { x: number; y: number }
}

export default function EmojiPicker({ onSelect, onClose, position }: EmojiPickerProps) {
    const [activeTab, setActiveTab] = useState<'recent' | 'emoji'>('recent')
    const [searchQuery, setSearchQuery] = useState('')
    const { data, loading, error } = useEmojiData()
    const searchResults = useEmojiSearch(data, searchQuery)
    const { recentEmojis, addRecentEmoji } = useRecentEmojis()
    const pickerRef = useRef<HTMLDivElement>(null)

    // 处理选择表情
    const handleSelect = (emoji: Emoji) => {
        addRecentEmoji(emoji)
        onSelect(emoji)
        onClose()
    }

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    // 键盘事件处理
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (loading) {
        return (
            <div
                ref={pickerRef}
                className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg w-80 h-96 flex items-center justify-center"
                style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="text-muted-foreground">加载中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div
                ref={pickerRef}
                className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg w-80 h-96 flex items-center justify-center"
                style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="text-destructive">加载失败: {error}</div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div
            ref={pickerRef}
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg w-80 h-96 flex flex-col"
            style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
            {/* 搜索栏 */}
            <div className="p-3 border-b border-border">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索表情..."
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* 搜索结果 */}
            {searchQuery.trim() && (
                <div className="flex-1 overflow-y-auto p-3">
                    {searchResults.hasResults ? (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2 text-foreground">Emoji</h3>
                            <div className="grid grid-cols-8 gap-1">
                                {searchResults.emojis.map(emoji => (
                                    <button
                                        key={emoji.id}
                                        onClick={() => handleSelect(emoji)}
                                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent rounded transition-colors"
                                        title={emoji.name}
                                    >
                                        {emoji.unicode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            没有找到相关表情
                        </div>
                    )}
                </div>
            )}

            {/* 正常显示 */}
            {!searchQuery.trim() && (
                <>
                    {/* 标签页 */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'recent'
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            🕐 最近
                        </button>
                        <button
                            onClick={() => setActiveTab('emoji')}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'emoji'
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            😀 Emoji
                        </button>
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {activeTab === 'recent' && (
                            <div>
                                {recentEmojis.length > 0 ? (
                                    <div className="grid grid-cols-8 gap-1">
                                        {recentEmojis.map((emoji, index) => (
                                            <button
                                                key={`${emoji.id}-${index}`}
                                                onClick={() => handleSelect(emoji)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
                                                title={emoji.name}
                                            >
                                                <span className="text-lg">{emoji.unicode}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        暂无最近使用的表情
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'emoji' && (
                            <div>
                                {data.emojis.map(category => (
                                    <div key={category.id} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2 text-foreground">
                                            {category.icon} {category.name}
                                        </h3>
                                        <div className="grid grid-cols-8 gap-1">
                                            {category.emojis.map(emoji => (
                                                <button
                                                    key={emoji.id}
                                                    onClick={() => handleSelect(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent rounded transition-colors"
                                                    title={emoji.name}
                                                >
                                                    {emoji.unicode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
} 