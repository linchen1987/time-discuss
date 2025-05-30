'use client'

import { useState, useRef, useEffect } from 'react'
import { useEmojiData, useEmojiSearch, useRecentEmojis } from '@/hooks/useEmojiData'
import type { Emoji, Sticker } from '@/lib/emoji/data'

interface EmojiPickerProps {
    onSelect: (emoji: Emoji | Sticker) => void
    onClose: () => void
    position?: { x: number; y: number }
}

export default function EmojiPicker({ onSelect, onClose, position }: EmojiPickerProps) {
    const [activeTab, setActiveTab] = useState<'recent' | 'emoji' | 'stickers'>('recent')
    const [searchQuery, setSearchQuery] = useState('')
    const { data, loading, error } = useEmojiData()
    const searchResults = useEmojiSearch(data, searchQuery)
    const { recentEmojis, addRecentEmoji } = useRecentEmojis()
    const pickerRef = useRef<HTMLDivElement>(null)

    // 处理选择表情
    const handleSelect = (item: Emoji | Sticker) => {
        addRecentEmoji(item)
        onSelect(item)
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
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-80 h-96 flex items-center justify-center"
                style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="text-gray-500">加载中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div
                ref={pickerRef}
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-80 h-96 flex items-center justify-center"
                style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="text-red-500">加载失败: {error}</div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div
            ref={pickerRef}
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-80 h-96 flex flex-col"
            style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
            {/* 搜索栏 */}
            <div className="p-3 border-b border-gray-200">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索表情..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
            </div>

            {/* 搜索结果 */}
            {searchQuery.trim() && (
                <div className="flex-1 overflow-y-auto p-3">
                    {searchResults.hasResults ? (
                        <>
                            {searchResults.emojis.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium mb-2 text-gray-700">Emoji</h3>
                                    <div className="grid grid-cols-8 gap-1">
                                        {searchResults.emojis.map(emoji => (
                                            <button
                                                key={emoji.id}
                                                onClick={() => handleSelect(emoji)}
                                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                                title={emoji.name}
                                            >
                                                {emoji.unicode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResults.stickers.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium mb-2 text-gray-700">表情包</h3>
                                    <div className="grid grid-cols-6 gap-2">
                                        {searchResults.stickers.map(sticker => (
                                            <button
                                                key={sticker.id}
                                                onClick={() => handleSelect(sticker)}
                                                className="w-10 h-10 flex flex-col items-center justify-center hover:bg-gray-100 rounded transition-colors p-1"
                                                title={sticker.name}
                                            >
                                                {sticker.fallbackEmoji ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg">{sticker.fallbackEmoji}</span>
                                                        <span className="text-xs text-gray-600 leading-none">{sticker.name}</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={sticker.imageUrl}
                                                        alt={sticker.name}
                                                        className="w-8 h-8 object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                            target.parentElement!.innerHTML = `<span class="text-xs text-gray-500">${sticker.name}</span>`
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            没有找到相关表情
                        </div>
                    )}
                </div>
            )}

            {/* 正常显示 */}
            {!searchQuery.trim() && (
                <>
                    {/* 标签页 */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'recent'
                                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            🕐 最近
                        </button>
                        <button
                            onClick={() => setActiveTab('emoji')}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'emoji'
                                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            😀 Emoji
                        </button>
                        <button
                            onClick={() => setActiveTab('stickers')}
                            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${activeTab === 'stickers'
                                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            🎭 表情包
                        </button>
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {activeTab === 'recent' && (
                            <div>
                                {recentEmojis.length > 0 ? (
                                    <div className="grid grid-cols-8 gap-1">
                                        {recentEmojis.map((item, index) => (
                                            <button
                                                key={`${item.id}-${index}`}
                                                onClick={() => handleSelect(item)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                                                title={item.name}
                                            >
                                                {'unicode' in item ? (
                                                    <span className="text-lg">{item.unicode}</span>
                                                ) : 'fallbackEmoji' in item && item.fallbackEmoji ? (
                                                    <span className="text-lg" title={item.name}>{item.fallbackEmoji}</span>
                                                ) : (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                            target.parentElement!.innerHTML = `<span class="text-xs text-gray-500" title="${item.name}">${item.name}</span>`
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        暂无最近使用的表情
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'emoji' && (
                            <div>
                                {data.emojis.map(category => (
                                    <div key={category.id} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2 text-gray-700">
                                            {category.icon} {category.name}
                                        </h3>
                                        <div className="grid grid-cols-8 gap-1">
                                            {category.emojis.map(emoji => (
                                                <button
                                                    key={emoji.id}
                                                    onClick={() => handleSelect(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
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

                        {activeTab === 'stickers' && (
                            <div>
                                {data.stickers.map(pack => (
                                    <div key={pack.id} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2 text-gray-700">
                                            {pack.name}
                                        </h3>
                                        <div className="grid grid-cols-6 gap-2">
                                            {pack.stickers.map(sticker => (
                                                <button
                                                    key={sticker.id}
                                                    onClick={() => handleSelect(sticker)}
                                                    className="w-12 h-12 flex flex-col items-center justify-center hover:bg-gray-100 rounded transition-colors p-1"
                                                    title={sticker.name}
                                                >
                                                    {sticker.fallbackEmoji ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-lg">{sticker.fallbackEmoji}</span>
                                                            <span className="text-xs text-gray-600 leading-none truncate max-w-full">{sticker.name}</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={sticker.imageUrl}
                                                            alt={sticker.name}
                                                            className="w-8 h-8 object-contain"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                                target.parentElement!.innerHTML = `<span class="text-xs text-gray-500">${sticker.name}</span>`
                                                            }}
                                                        />
                                                    )}
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