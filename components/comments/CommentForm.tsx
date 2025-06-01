"use client"

import { useSession } from "next-auth/react"
import { createComment } from "@/app/actions/comments"
import { RichTextForm } from "@/components/ui/RichTextForm"
import type { CommentWithDetails } from "@/lib/types"

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

    // 根据是否是回复来确定模式
    const editorMode = replyToUser ? 'reply' : 'comment'

    // 如果是回复，在placeholder中显示被回复的用户
    const finalPlaceholder = replyToUser
        ? `回复 @${replyToUser.name}...`
        : placeholder

    const handleSubmit = async (
        editorState: Record<string, unknown> | null,
        contentHtml: string,
        uploadedImages: string[]
    ) => {
        if (!user) {
            throw new Error('请先登录')
        }

        return await createComment(
            user.id,
            postId,
            editorState,
            contentHtml,
            uploadedImages,
            replyToUser?.id
        )
    }

    const handleSuccess = (newComment: unknown) => {
        if (onCommentCreated) {
            onCommentCreated(newComment as CommentWithDetails)
        }
    }

    if (!session) return null

    return (
        <div className={`${compact ? 'p-2' : 'p-4'} ${replyToUser ? 'border-l-2 border-muted ml-4' : 'border-b border-border'}`}>
            <RichTextForm
                onSubmit={handleSubmit}
                onSuccess={handleSuccess}
                onCancel={onCancel}
                placeholder={finalPlaceholder}
                submitText="评论"
                successMessage="评论成功！"
                errorMessage="发布失败，请重试"
                mode={editorMode}
                maxHeight={replyToUser ? "120px" : "150px"}
                compact={compact}
                showCancel={!!replyToUser}
                cancelText="取消"
                componentName="CommentForm"
            />
        </div>
    )
} 