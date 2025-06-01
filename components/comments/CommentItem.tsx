"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { ContentItem } from "@/components/ui/ContentItem"
import { CommentForm } from "./CommentForm"
import type { CommentWithDetails } from "@/lib/types"

interface CommentItemProps {
    comment: CommentWithDetails
    onReplyCreated?: (comment: CommentWithDetails) => void
    onCommentDeleted?: (commentId: string) => void
    onCommentUpdated?: (updatedComment: CommentWithDetails) => void
    className?: string
}

export function CommentItem({
    comment,
    onReplyCreated,
    onCommentDeleted,
    onCommentUpdated,
    className
}: CommentItemProps) {
    const { data: session } = useSession()
    const [showReplyForm, setShowReplyForm] = useState(false)

    const handleReplyClick = () => {
        if (!session) return
        setShowReplyForm(true)
    }

    const handleCancelReply = () => {
        setShowReplyForm(false)
    }

    const handleReplyCreated = (newReply: CommentWithDetails) => {
        setShowReplyForm(false)
        if (onReplyCreated) {
            onReplyCreated(newReply)
        }
    }

    // 阻止事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div className={`py-3 ${className}`}>
            <ContentItem
                content={comment}
                type="comment"
                onDeleted={onCommentDeleted}
                onUpdated={onCommentUpdated}
                onReplyClick={handleReplyClick}
                showReplyButton={true}
                stopPropagation={stopPropagation}
            >
                {/* 回复表单 */}
                {showReplyForm && (
                    <div className="mt-4">
                        <CommentForm
                            postId={comment.postId}
                            replyToUser={{
                                id: comment.authorId,
                                name: comment.author.name || "匿名用户"
                            }}
                            onCommentCreated={handleReplyCreated}
                            onCancel={handleCancelReply}
                            placeholder={`回复 @${comment.author.name || "匿名用户"}...`}
                            compact={true}
                        />
                    </div>
                )}
            </ContentItem>
        </div>
    )
} 