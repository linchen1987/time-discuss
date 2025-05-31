"use client"

import React, { useState } from 'react'
import LexicalEditor from './LexicalEditor'
import { EditorToolbar } from './EditorToolbar'
import { ImagePreview } from '@/components/ui/ImagePreview'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { Emoji } from '@/lib/emoji/data'

interface RichTextEditorProps {
    // 编辑器相关
    placeholder?: string
    initialValue?: string
    onChange?: (editorState: Record<string, unknown>, html: string) => void
    onSubmit?: () => void
    className?: string

    // 新增：模式相关
    mode?: 'post' | 'comment' | 'reply' // 使用模式
    maxHeight?: string // 最大高度限制

    // 图片相关
    maxImages?: number
    initialImages?: string[]
    onImagesChange?: (images: string[]) => void

    // 工具栏相关
    showBold?: boolean
    showImageUpload?: boolean
    showEmoji?: boolean
    showSubmit?: boolean
    submitText?: string
    isSubmitting?: boolean
    disabled?: boolean

    // 其他
    showToolbar?: boolean
    showCancel?: boolean
    onCancel?: () => void
    cancelText?: string
    customActions?: React.ReactNode // 自定义操作按钮
}

export function RichTextEditor({
    placeholder = "写点什么...",
    initialValue,
    onChange,
    onSubmit,
    className = "",
    mode = 'post',
    maxHeight,
    maxImages = 9,
    initialImages = [],
    onImagesChange,
    showBold = true,
    showImageUpload = true,
    showEmoji = true,
    showSubmit = true,
    submitText = "发布",
    isSubmitting = false,
    disabled = false,
    showToolbar = true,
    showCancel = false,
    onCancel,
    cancelText = "取消",
    customActions
}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<Record<string, unknown> | null>(null)
    const [isBold, setIsBold] = useState(false)

    const {
        uploadedImages,
        isUploading,
        handleImageUpload,
        removeImage,
        setUploadedImages
    } = useImageUpload({ maxImages })

    // 根据模式调整配置
    const modeConfig = {
        post: {
            maxImages: 9,
            showFullToolbar: true,
            compactMode: false,
            minHeight: '100px',
        },
        comment: {
            maxImages: 4,
            showFullToolbar: true,
            compactMode: true,
            minHeight: '80px',
        },
        reply: {
            maxImages: 4, // 回复时也支持图片，和comment模式一样
            showFullToolbar: true, // 显示完整工具栏
            compactMode: true,
            minHeight: '60px',
        }
    }

    const config = modeConfig[mode]

    // 动态计算样式
    const editorStyle = maxHeight ? { maxHeight, overflowY: 'auto' as const } : {}

    // 初始化图片
    React.useEffect(() => {
        if (initialImages.length > 0) {
            setUploadedImages(initialImages)
        }
    }, [initialImages, setUploadedImages])

    // 监听图片变化
    React.useEffect(() => {
        onImagesChange?.(uploadedImages)
    }, [uploadedImages, onImagesChange])

    const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
        setEditorState(editorState)
        onChange?.(editorState, html)
    }

    const handleFormatChange = (formats: { isBold: boolean }) => {
        setIsBold(formats.isBold)
    }

    const handleBoldFormat = () => {
        const event = new Event('formatBold')
        window.dispatchEvent(event)
    }

    const handleEmojiSelect = (emoji: Emoji) => {
        const event = new CustomEvent('insertEmoji', {
            detail: { emoji }
        })
        window.dispatchEvent(event)
    }

    const handleImagePaste = (files: File[]) => {
        // 所有模式都支持图片上传，根据maxImages限制即可
        const fileList = {
            length: files.length,
            item: (index: number) => files[index] || null,
            [Symbol.iterator]: function* () {
                for (let i = 0; i < files.length; i++) {
                    yield files[i]
                }
            }
        } as FileList
        handleImageUpload(fileList)
    }

    const canSubmit = editorState || uploadedImages.length > 0

    return (
        <div className={`border border-border rounded-md bg-background ${className}`}>
            <div style={editorStyle}>
                <LexicalEditor
                    placeholder={placeholder}
                    initialValue={initialValue}
                    onChange={handleEditorChange}
                    onFormatChange={handleFormatChange}
                    onSubmit={onSubmit}
                    onImagePaste={handleImagePaste}
                    showToolbar={false}
                    className="border-none shadow-none"
                    minHeight={config.minHeight}
                />
            </div>

            {/* 图片预览 - 所有模式都显示 */}
            <ImagePreview
                images={uploadedImages}
                onRemove={removeImage}
                className="mt-4 mx-4"
            />

            {/* 工具栏 */}
            {showToolbar && (
                <EditorToolbar
                    isBold={isBold}
                    onBoldFormat={showBold && config.showFullToolbar ? handleBoldFormat : undefined}
                    onImageUpload={showImageUpload ? handleImageUpload : undefined}
                    isUploading={isUploading}
                    imageCount={uploadedImages.length}
                    maxImages={config.maxImages}
                    onEmojiSelect={showEmoji && config.showFullToolbar ? handleEmojiSelect : undefined}
                    onSubmit={showSubmit ? onSubmit : undefined}
                    submitText={submitText}
                    isSubmitting={isSubmitting}
                    disabled={disabled || !canSubmit}
                    showBold={showBold && config.showFullToolbar}
                    showImageUpload={showImageUpload}
                    showEmoji={showEmoji && config.showFullToolbar}
                    showSubmit={showSubmit}
                    showCancel={showCancel}
                    onCancel={onCancel}
                    cancelText={cancelText}
                    customActions={customActions}
                    className={`mt-4 p-4 border-t ${config.compactMode ? 'py-2' : ''}`}
                />
            )}
        </div>
    )
} 