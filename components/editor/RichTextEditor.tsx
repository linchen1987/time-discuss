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
}

export function RichTextEditor({
    placeholder = "写点什么...",
    initialValue,
    onChange,
    onSubmit,
    className = "",
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
    showToolbar = true
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
            <LexicalEditor
                placeholder={placeholder}
                initialValue={initialValue}
                onChange={handleEditorChange}
                onFormatChange={handleFormatChange}
                onSubmit={onSubmit}
                onImagePaste={handleImagePaste}
                showToolbar={false}
                className="border-none shadow-none"
            />

            {/* 图片预览 */}
            <ImagePreview
                images={uploadedImages}
                onRemove={removeImage}
                className="mt-4 mx-4"
            />

            {/* 工具栏 */}
            {showToolbar && (
                <EditorToolbar
                    isBold={isBold}
                    onBoldFormat={showBold ? handleBoldFormat : undefined}
                    onImageUpload={showImageUpload ? handleImageUpload : undefined}
                    isUploading={isUploading}
                    imageCount={uploadedImages.length}
                    maxImages={maxImages}
                    onEmojiSelect={showEmoji ? handleEmojiSelect : undefined}
                    onSubmit={showSubmit ? onSubmit : undefined}
                    submitText={submitText}
                    isSubmitting={isSubmitting}
                    disabled={disabled || !canSubmit}
                    showBold={showBold}
                    showImageUpload={showImageUpload}
                    showEmoji={showEmoji}
                    showSubmit={showSubmit}
                    className="mt-4 p-4 border-t"
                />
            )}
        </div>
    )
} 