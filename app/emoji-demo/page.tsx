'use client'

import { useState } from 'react'
import EmojiPicker from '@/components/emoji/EmojiPicker'
import type { Emoji } from '@/lib/emoji/data'

export default function EmojiDemoPage() {
    const [showPicker, setShowPicker] = useState(false)
    const [selectedEmojis, setSelectedEmojis] = useState<Emoji[]>([])

    const handleEmojiSelect = (emoji: Emoji) => {
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
                        Emoji 表情演示
                    </h1>

                    <div className="space-y-6">
                        {/* 介绍 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                😊 Emoji 功能介绍
                            </h2>
                            <ul className="text-blue-800 space-y-1 text-sm">
                                <li>• 包含常用的标准 Emoji 表情</li>
                                <li>• 支持按关键词搜索表情</li>
                                <li>• 记录最近使用的表情</li>
                                <li>• 支持中文关键词搜索（如：微笑、思考、赞等）</li>
                            </ul>
                        </div>

                        {/* 表情分类说明 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                📋 表情分类
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">😊 笑脸表情（34个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 嘿嘿、哈哈、笑哭了、呵呵</li>
                                        <li>• 眨眼、害羞、花痴、飞吻</li>
                                        <li>• 思考、冷漠、翻白眼、累死了</li>
                                        <li>• 爱心眼、星星眼、庆祝、坏笑</li>
                                        <li>• 睡觉、流口水、戴口罩、墨镜</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">👍 手势表情（18个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 赞、踩、鼓掌、挥手</li>
                                        <li>• OK、胜利、拳头、爱心</li>
                                        <li>• 祈祷、肌肉、指向、交叉手指</li>
                                        <li>• 嘘、握手、爱心手势</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">🐱 动物表情（16个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 猫咪、狗狗、老鼠、仓鼠</li>
                                        <li>• 兔子、狐狸、熊、熊猫</li>
                                        <li>• 考拉、老虎、狮子、猪</li>
                                        <li>• 猴子、鸡、企鹅、鸟</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">🍎 食物表情（16个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 苹果、香蕉、葡萄、草莓</li>
                                        <li>• 西瓜、桃子、披萨、汉堡</li>
                                        <li>• 薯条、热狗、寿司、拉面</li>
                                        <li>• 蛋糕、冰淇淋、咖啡</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">⚽ 活动表情（16个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 足球、篮球、网球、棒球</li>
                                        <li>• 乒乓球、羽毛球、游泳、跑步</li>
                                        <li>• 骑行、吉他、钢琴、麦克风</li>
                                        <li>• 耳机、画画、相机、摄像机</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">💎 物品表情（16个）：</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>• 钻石、戒指、王冠、手表</li>
                                        <li>• 眼镜、领带、衬衫、牛仔裤</li>
                                        <li>• 连衣裙、高跟鞋、运动鞋、背包</li>
                                        <li>• 手提包、公文包、雨伞、礼物</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <p className="text-gray-600 text-sm">
                                    <strong>总计：116个常用表情</strong>，涵盖日常聊天的各种场景和情感表达
                                </p>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowPicker(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                😊 打开表情选择器
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
                                    {selectedEmojis.map((emoji, index) => (
                                        <div
                                            key={`${emoji.id}-${index}`}
                                            className="inline-flex items-center gap-2 bg-white border border-green-300 rounded-lg px-3 py-2"
                                        >
                                            <span className="text-xl">{emoji.unicode}</span>
                                            <span className="text-sm text-gray-700">{emoji.name}</span>
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
                                    {['微笑', '思考', '赞', '开心', '生气', '哭', '爱心', '胜利', '翻白眼', '累死了', '猫咪', '狗狗', '熊猫', '苹果', '披萨', '足球', '音乐', '钻石', '王冠', '礼物'].map(keyword => (
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
                                <li>3. 切换&ldquo;最近&rdquo;和&ldquo;Emoji&rdquo;标签页浏览</li>
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