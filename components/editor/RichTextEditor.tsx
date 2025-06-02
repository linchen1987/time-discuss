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
    initialValue?: string | Record<string, unknown> | null
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
    canSubmit?: boolean // 新增：外部控制是否可以提交
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
    customActions,
    canSubmit
}: RichTextEditorProps) {
    const [isBold, setIsBold] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [contentHtml, setContentHtml] = useState('')

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
            minHeight: '100px',
            focusedMinHeight: '100px', // 聚焦时的最小高度
        },
        comment: {
            maxImages: 4,
            showFullToolbar: true,
            minHeight: '80px',
            focusedMinHeight: '80px',
        },
        reply: {
            maxImages: 4, // 回复时也支持图片，和comment模式一样
            showFullToolbar: true, // 显示完整工具栏
            minHeight: '60px',
            focusedMinHeight: '60px',
        }
    }

    const config = modeConfig[mode]

    // 动态计算样式
    const editorStyle = maxHeight ? { maxHeight, overflowY: 'auto' as const } : {}

    // 动态计算最小高度
    const currentMinHeight = isFocused ? config.focusedMinHeight : config.minHeight

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

    const handleEditorChange = (newEditorState: Record<string, unknown>, html: string) => {
        setContentHtml(html)
        onChange?.(newEditorState, html)
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

    const handleFocus = () => {
        console.log('Editor focused - changing height to:', config.focusedMinHeight)
        setIsFocused(true)
    }

    const handleBlur = () => {
        console.log('Editor blurred - changing height to:', config.minHeight)
        setIsFocused(false)
    }

    // 内部计算是否可以提交（只检查实际内容，不依赖 editorState）
    const internalCanSubmit = Boolean(contentHtml.trim().length > 0 || uploadedImages.length > 0)

    // 最终的 canSubmit 状态：优先使用外部传入的值，否则使用内部计算的值
    const finalCanSubmit = canSubmit !== undefined ? canSubmit : internalCanSubmit

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
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    showToolbar={false}
                    className="border-none shadow-none"
                    minHeight={currentMinHeight}
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
                    disabled={disabled || !finalCanSubmit}
                    showBold={showBold && config.showFullToolbar}
                    showImageUpload={showImageUpload}
                    showEmoji={showEmoji && config.showFullToolbar}
                    showSubmit={showSubmit}
                    showCancel={showCancel}
                    onCancel={onCancel}
                    cancelText={cancelText}
                    customActions={customActions}
                    className={`mt-4 py-2 border-t`}
                />
            )}
        </div>
    )
} 