"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"
import { ImagePlus, X, Loader2, Smile, Bold } from "lucide-react"
import Image from "next/image"
import LexicalEditor from "./editor/LexicalEditor"
import EmojiPicker from "@/components/emoji/EmojiPicker"
import type { Emoji } from "@/lib/emoji/data"
import type { PostWithDetails } from "@/lib/types"

interface PostFormProps {
    onPostCreated?: (newPost: PostWithDetails) => void
}

export function PostForm({ onPostCreated }: PostFormProps) {
    const { data: session } = useSession()
    type UserWithAvatar = { avatarUrl?: string | null; name?: string | null };
    const user = session?.user as UserWithAvatar | undefined

    const [editorState, setEditorState] = useState<Record<string, unknown> | null>(null)
    const [contentHtml, setContentHtml] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [editorKey, setEditorKey] = useState(0)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isBold, setIsBold] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!editorState || !contentHtml.trim()) && uploadedImages.length === 0) return
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            // 将编辑器状态传递给 createPost
            const newPost = await createPost(editorState, contentHtml, uploadedImages)

            // 重置编辑器状态
            setEditorState(null)
            setContentHtml("")
            setUploadedImages([])
            setEditorKey(prev => prev + 1)
            setShowEmojiPicker(false)
            toast.success("发布成功！")

            if (onPostCreated && newPost) {
                onPostCreated(newPost as PostWithDetails)
            }
        } catch (err) {
            console.error("Failed to create post:", err)
            const errorMessage = err instanceof Error ? err.message : "发布失败，请稍后重试"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
        setEditorState(editorState)
        setContentHtml(html)
    }

    const handleEmojiSelect = (emoji: Emoji) => {
        // 触发编辑器插入表情的事件
        const event = new CustomEvent('insertEmoji', {
            detail: { emoji }
        })
        window.dispatchEvent(event)
        setShowEmojiPicker(false)
    }

    const handleBoldFormat = () => {
        // 触发编辑器加粗格式事件
        const event = new Event('formatBold')
        window.dispatchEvent(event)
    }

    const handleFormatChange = (formats: { isBold: boolean }) => {
        setIsBold(formats.isBold)
    }

    const handleImageUpload = async (files: FileList) => {
        if (files.length === 0) return

        const fileArray = Array.from(files)
        if (uploadedImages.length + fileArray.length > 9) {
            toast.error('最多上传9张图片')
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            fileArray.forEach(file => {
                formData.append('files', file)
            })

            const response = await fetch('/api/uploads/post-images', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '上传失败')
            }

            const data = await response.json()
            setUploadedImages(prev => [...prev, ...data.urls])
            toast.success('图片上传成功')
        } catch (error) {
            console.error('Image upload error:', error)
            toast.error(error instanceof Error ? error.message : '图片上传失败')
        } finally {
            setIsUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            handleImageUpload(files)
        }
        // 重置input值，允许重复选择同一文件
        e.target.value = ''
    }

    if (!session) return null

    return (
        <div className="border-b border-border">
            <div className="p-4">
                <div className="flex space-x-3">
                    <Avatar>
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback>
                            {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <form onSubmit={handleSubmit}>
                            <LexicalEditor
                                key={editorKey}
                                placeholder="有什么新鲜事？"
                                onChange={handleEditorChange}
                                onFormatChange={handleFormatChange}
                                showToolbar={false}
                                onSubmit={() => {
                                    // 模拟表单提交事件
                                    const form = document.querySelector('form')
                                    if (form) {
                                        const event = new Event('submit', { cancelable: true, bubbles: true })
                                        form.dispatchEvent(event)
                                    }
                                }}
                                onImagePaste={(files) => {
                                    // 将 File[] 转换为 FileList
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
                                }}
                                className="border-none shadow-none"
                            />

                            {/* 图片预览区域 */}
                            {uploadedImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {uploadedImages.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={url}
                                                alt={`上传的图片 ${index + 1}`}
                                                width={200}
                                                height={200}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBoldFormat}
                                        className={`text-blue-500 hover:text-blue-600 ${isBold ? 'bg-blue-100' : ''}`}
                                    >
                                        <Bold className="w-5 h-5" />
                                    </Button>

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
                                        disabled={isUploading || uploadedImages.length >= 9}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ImagePlus className="w-5 h-5" />
                                        )}
                                    </Button>

                                    <Button
                                        ref={emojiButtonRef}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </Button>

                                    <div className="text-sm text-muted-foreground">
                                        {uploadedImages.length > 0 && `${uploadedImages.length}/9 图片`}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={(!editorState && uploadedImages.length === 0) || isSubmitting}
                                    className="rounded-full"
                                >
                                    {isSubmitting ? "发布中..." : "发布"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 表情包选择器 */}
            {showEmojiPicker && (
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

            <Separator />
        </div>
    )
} 