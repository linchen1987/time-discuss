"use client"

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, ImagePlus, Smile, Loader2 } from 'lucide-react'
import EmojiPicker from '@/components/emoji/EmojiPicker'
import type { Emoji } from '@/lib/emoji/data'

interface EditorToolbarProps {
    // 格式化相关
    isBold?: boolean
    onBoldFormat?: () => void

    // 图片上传相关
    onImageUpload?: (files: FileList) => void
    isUploading?: boolean
    imageCount?: number
    maxImages?: number

    // 表情相关
    onEmojiSelect?: (emoji: Emoji) => void

    // 提交相关
    onSubmit?: () => void
    submitText?: string
    isSubmitting?: boolean
    disabled?: boolean

    // UI控制
    showBold?: boolean
    showImageUpload?: boolean
    showEmoji?: boolean
    showSubmit?: boolean
    showCancel?: boolean
    onCancel?: () => void
    cancelText?: string
    customActions?: React.ReactNode // 自定义操作按钮
    className?: string
}

export function EditorToolbar({
    isBold = false,
    onBoldFormat,
    onImageUpload,
    isUploading = false,
    imageCount = 0,
    maxImages = 9,
    onEmojiSelect,
    onSubmit,
    submitText = "发布",
    isSubmitting = false,
    disabled = false,
    showBold = true,
    showImageUpload = true,
    showEmoji = true,
    showSubmit = true,
    showCancel = false,
    onCancel,
    cancelText = "取消",
    customActions,
    className = ""
}: EditorToolbarProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && onImageUpload) {
            onImageUpload(files)
        }
        e.target.value = ''
    }

    const handleEmojiSelect = (emoji: Emoji) => {
        onEmojiSelect?.(emoji)
        setShowEmojiPicker(false)
    }

    return (
        <>
            <div className={`flex items-center justify-between ${className}`}>
                <div className="flex items-center space-x-0">
                    {/* 加粗按钮 */}
                    {showBold && onBoldFormat && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onBoldFormat}
                            className={`text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 ${isBold ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                        >
                            <Bold className="w-5 h-5 stroke-2" />
                        </Button>
                    )}

                    {/* 图片上传按钮 */}
                    {showImageUpload && onImageUpload && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || imageCount >= maxImages}
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ImagePlus className="w-5 h-5 stroke-2" />
                                )}
                            </Button>
                        </>
                    )}

                    {/* 表情按钮 */}
                    {showEmoji && onEmojiSelect && (
                        <Button
                            ref={emojiButtonRef}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                        >
                            <Smile className="w-5 h-5 stroke-2" />
                        </Button>
                    )}

                    {/* 图片计数显示 */}
                    {showImageUpload && imageCount > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {imageCount}/{maxImages} 图片
                        </div>
                    )}
                </div>

                {/* 提交按钮区域 */}
                {customActions ? (
                    customActions
                ) : (showSubmit && onSubmit) || (showCancel && onCancel) ? (
                    <div className="flex items-center space-x-2">
                        {showCancel && onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                {cancelText}
                            </Button>
                        )}
                        {showSubmit && onSubmit && (
                            <Button
                                type="button"
                                onClick={onSubmit}
                                disabled={disabled || isSubmitting}
                                className="rounded-full"
                            >
                                {isSubmitting ? `${submitText}中...` : submitText}
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>

            {/* 表情选择器 */}
            {showEmojiPicker && onEmojiSelect && (
                <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                    position={
                        emojiButtonRef.current ? {
                            x: emojiButtonRef.current.getBoundingClientRect().left,
                            y: emojiButtonRef.current.getBoundingClientRect().bottom + 8
                        } : undefined
                    }
                />
            )}
        </>
    )
} 