"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createComment } from "@/app/actions/comments"
import { toast } from "sonner"
import { RichTextEditor } from "../editor/RichTextEditor"
import type { CommentWithDetails } from "@/lib/types"
import { logError } from '@/lib/debug'

interface CommentFormProps {
    postId: string
    replyToUser?: {
        id: string
        name: string
    } // 回复的目标用户
    onCommentCreated?: (comment: CommentWithDetails) => void
    onCancel?: () => void // 回复时可取消
    placeholder?: string
    compact?: boolean // 紧凑模式
}

export function CommentForm({
    postId,
    replyToUser,
    onCommentCreated,
    onCancel,
    placeholder = "写下你的想法...",
    compact = false
}: CommentFormProps) {
    const { data: session } = useSession()
    type UserWithAvatar = { avatarUrl?: string | null; name?: string | null; id: string }
    const user = session?.user as UserWithAvatar | undefined

    const [editorState, setEditorState] = useState<Record<string, unknown> | null>(null)
    const [contentHtml, setContentHtml] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
    const [editorKey, setEditorKey] = useState(0)

    // 根据是否是回复来确定模式
    const editorMode = replyToUser ? 'reply' : 'comment'

    // 如果是回复，在placeholder中显示被回复的用户
    const finalPlaceholder = replyToUser
        ? `回复 @${replyToUser.name}...`
        : placeholder

    const handleSubmit = async () => {
        if (!session || !user) {
            toast.error('请先登录')
            return
        }

        if ((!editorState || !contentHtml.trim()) && uploadedImages.length === 0) {
            toast.error('请输入评论内容')
            return
        }

        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const newComment = await createComment(
                user.id,
                postId,
                editorState,
                contentHtml,
                uploadedImages,
                replyToUser?.id
            )

            // 重置编辑器状态
            setEditorState(null)
            setContentHtml("")
            setUploadedImages([])
            setEditorKey(prev => prev + 1)

            toast.success("评论成功！")

            if (onCommentCreated) {
                onCommentCreated(newComment)
            }

            // 如果是回复，自动取消回复模式
            if (replyToUser && onCancel) {
                onCancel()
            }

        } catch (err) {
            logError('CommentForm', err, 'Failed to create comment')
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
        <div className={`${compact ? 'p-2' : 'p-4'} ${replyToUser ? 'border-l-2 border-muted ml-4' : 'border-b border-border'}`}>
            <div className="flex space-x-3">
                <Avatar className={compact ? 'h-10 w-10' : 'h-10 w-10'}>
                    <AvatarImage src={user?.avatarUrl || ""} />
                    <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <RichTextEditor
                        key={editorKey}
                        placeholder={finalPlaceholder}
                        onChange={handleEditorChange}
                        onImagesChange={handleImagesChange}
                        onSubmit={handleSubmit}
                        submitText="评论"
                        isSubmitting={isSubmitting}
                        mode={editorMode}
                        maxHeight={replyToUser ? "120px" : "150px"}
                        showImageUpload={!replyToUser} // 回复时不显示图片上传
                        className="border-none shadow-none"
                    />

                    {/* 回复时显示取消按钮 */}
                    {replyToUser && onCancel && (
                        <div className="mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                取消回复
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 