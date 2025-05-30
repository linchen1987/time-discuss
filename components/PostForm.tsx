"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"
import { RichTextEditor } from "./editor/RichTextEditor"
import type { PostWithDetails } from "@/lib/types"
import { logError } from '@/lib/debug'

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
    const [editorKey, setEditorKey] = useState(0)

    const handleSubmit = async () => {
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
            toast.success("发布成功！")

            if (onPostCreated && newPost) {
                onPostCreated(newPost as PostWithDetails)
            }
        } catch (err) {
            logError('PostForm', err, 'Failed to create post')
            toast.error(err instanceof Error ? err.message : '发布失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
        setEditorState(editorState)
        setContentHtml(html)
    }

    const handleImagesChange = (images: string[]) => {
        setUploadedImages(images)
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
                        <RichTextEditor
                            key={editorKey}
                            placeholder="有什么新鲜事？"
                            onChange={handleEditorChange}
                            onImagesChange={handleImagesChange}
                            onSubmit={handleSubmit}
                            submitText="发布"
                            isSubmitting={isSubmitting}
                            className="border-none shadow-none"
                        />
                    </div>
                </div>
            </div>

            <Separator />
        </div>
    )
} 