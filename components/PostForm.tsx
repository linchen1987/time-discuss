"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"

export function PostForm() {
    const { data: session } = useSession()
    type UserWithAvatar = { avatarUrl?: string | null; name?: string | null };
    const user = session?.user as UserWithAvatar | undefined
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!content.trim() && uploadedImages.length === 0) || isSubmitting) return

        setIsSubmitting(true)
        try {
            await createPost(content.trim(), uploadedImages)
            setContent("")
            setUploadedImages([])
            toast.success("发布成功！")
        } catch (err) {
            console.error("Failed to create post:", err)
            const errorMessage = err instanceof Error ? err.message : "发布失败，请稍后重试"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        const imageFiles: File[] = []

        // 检查剪贴板中的所有项目
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (file) {
                    imageFiles.push(file)
                }
            }
        }

        // 如果找到图片文件，阻止默认粘贴行为并上传图片
        if (imageFiles.length > 0) {
            e.preventDefault()
            const fileList = new DataTransfer()
            imageFiles.forEach(file => fileList.items.add(file))
            await handleImageUpload(fileList.files)
        }
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
                            <Textarea
                                placeholder="有什么新鲜事？"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                className="min-h-[120px] resize-none border-none px-4 py-3 text-xl placeholder:text-muted-foreground focus-visible:ring-0"
                                maxLength={280}
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
                                    <div className="text-sm text-muted-foreground">
                                        {content.length}/280
                                        {uploadedImages.length > 0 && ` • ${uploadedImages.length}/9 图片`}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={(!content.trim() && uploadedImages.length === 0) || isSubmitting}
                                    className="rounded-full"
                                >
                                    {isSubmitting ? "发布中..." : "发布"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Separator />
        </div>
    )
} 