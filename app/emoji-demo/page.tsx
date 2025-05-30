'use client'

import { useState } from 'react'
import EmojiPicker from '@/components/emoji/EmojiPicker'
import type { Emoji, Sticker } from '@/lib/emoji/data'

export default function EmojiDemoPage() {
    const [showPicker, setShowPicker] = useState(false)
    const [selectedEmojis, setSelectedEmojis] = useState<(Emoji | Sticker)[]>([])

    const handleEmojiSelect = (emoji: Emoji | Sticker) => {
        setSelectedEmojis(prev => [...prev, emoji])
    }

    const clearSelected = () => {
        setSelectedEmojis([])
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        微信经典表情包演示
                    </h1>

                    <div className="space-y-6">
                        {/* 介绍 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                🎭 表情包功能介绍
                            </h2>
                            <ul className="text-blue-800 space-y-1 text-sm">
                                <li>• 包含微信经典表情包和标准 Emoji</li>
                                <li>• 支持按关键词搜索表情</li>
                                <li>• 记录最近使用的表情</li>
                                <li>• 支持中文关键词搜索（如：狗头、doge、微笑等）</li>
                                <li>• 表情包目前使用emoji作为占位符显示（含名称标签）</li>
                            </ul>
                        </div>

                        {/* 表情包收录清单 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                📋 收录的微信经典表情
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">基础表情：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 微笑、撇嘴、色、发呆</li>
                                        <li>• 得意、流泪、害羞、闭嘴</li>
                                        <li>• 睡、大哭、尴尬、发怒</li>
                                        <li>• 调皮、呲牙、惊讶、难过</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">动作表情：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 鼓掌、强、弱、握手</li>
                                        <li>• 胜利、拥抱、拳头</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">2020新增：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 翻白眼、666、让我看看</li>
                                        <li>• 叹气、苦涩、裂开</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-2">网络经典：</h3>
                                <p className="text-gray-600 text-sm">
                                    doge（狗头保命）、黑人问号、pepe、皮卡丘、捂脸等
                                </p>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowPicker(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                🎭 打开表情选择器
                            </button>

                            {selectedEmojis.length > 0 && (
                                <button
                                    onClick={clearSelected}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    清空选择
                                </button>
                            )}
                        </div>

                        {/* 已选择的表情 */}
                        {selectedEmojis.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-green-900 mb-3">
                                    ✨ 已选择的表情 ({selectedEmojis.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEmojis.map((item, index) => (
                                        <div
                                            key={`${item.id}-${index}`}
                                            className="inline-flex items-center gap-2 bg-white border border-green-300 rounded-lg px-3 py-2"
                                        >
                                            {'unicode' in item ? (
                                                <span className="text-xl">{item.unicode}</span>
                                            ) : (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.style.display = 'none'
                                                        target.nextElementSibling!.textContent = `[${item.name}]`
                                                    }}
                                                />
                                            )}
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 搜索提示 */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                🔍 搜索提示
                            </h3>
                            <div className="text-yellow-800 text-sm space-y-1">
                                <p>试试搜索这些关键词：</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['狗头', 'doge', '微笑', '666', '翻白眼', '让我看看', '叹气', '裂开', '思考', '皮卡丘', '捂脸'].map(keyword => (
                                        <span
                                            key={keyword}
                                            className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs border border-yellow-300"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 使用说明 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                📖 使用说明
                            </h3>
                            <ul className="text-gray-700 text-sm space-y-1">
                                <li>1. 点击&ldquo;打开表情选择器&rdquo;按钮</li>
                                <li>2. 可以在搜索框输入关键词搜索表情</li>
                                <li>3. 切换&ldquo;最近&rdquo;、&ldquo;Emoji&rdquo;、&ldquo;表情包&rdquo;标签页浏览</li>
                                <li>4. 点击表情即可选择，会自动记录到&ldquo;最近&rdquo;中</li>
                                <li>5. 按 ESC 键或点击外部区域关闭选择器</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 表情选择器 */}
            {showPicker && (
                <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    )
} 