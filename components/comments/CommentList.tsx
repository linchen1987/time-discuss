"use client"

import { useState, useEffect } from "react"
import { CommentItem } from "./CommentItem"
import type { CommentWithDetails } from "@/lib/types"

interface CommentListProps {
    comments: CommentWithDetails[]
    loading?: boolean
    onLoadMore?: () => void
    hasMore?: boolean
}

export function CommentList({
    comments,
    loading,
    onLoadMore,
    hasMore
}: CommentListProps) {
    const [localComments, setLocalComments] = useState<CommentWithDetails[]>(comments)

    // 当外部comments变化时，同步到本地状态
    useEffect(() => {
        setLocalComments(comments)
    }, [comments])

    const handleReplyCreated = (newReply: CommentWithDetails) => {
        setLocalComments(prev => [...prev, newReply])
    }

    const handleCommentUpdated = (updatedComment: CommentWithDetails) => {
        setLocalComments(prev =>
            prev.map((comment: CommentWithDetails) =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        )
    }

    const handleCommentDeleted = (commentId: string) => {
        setLocalComments(prev =>
            prev.filter(comment => comment.id !== commentId)
        )
    }

    return (
        <div className="space-y-1">
            {/* 评论列表 */}
            <div className="divide-y divide-border">
                {localComments.map((comment) => (
                    <CommentItem
                        className="px-4"
                        key={comment.id}
                        comment={comment}
                        onReplyCreated={handleReplyCreated}
                        onCommentUpdated={handleCommentUpdated}
                        onCommentDeleted={handleCommentDeleted}
                    />
                ))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
                <div className="text-center py-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                        {loading ? '加载中...' : '加载更多评论'}
                    </button>
                </div>
            )}

            {/* 空状态 */}
            {localComments.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                    还没有评论，快来抢沙发吧！
                </div>
            )}
        </div>
    )
} 