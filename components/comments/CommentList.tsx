"use client"

import { useState } from "react"
import { CommentItem } from "./CommentItem"
import { CommentForm } from "./CommentForm"
import type { CommentWithDetails } from "@/lib/types"

interface CommentListProps {
    postId: string
    comments: CommentWithDetails[]
    loading?: boolean
    onLoadMore?: () => void
    hasMore?: boolean
}

export function CommentList({
    postId,
    comments,
    loading,
    onLoadMore,
    hasMore
}: CommentListProps) {
    const [localComments, setLocalComments] = useState<CommentWithDetails[]>(comments)

    const handleNewComment = (newComment: CommentWithDetails) => {
        setLocalComments(prev => [...prev, newComment])
    }

    const handleReplyCreated = (newReply: CommentWithDetails) => {
        setLocalComments(prev => [...prev, newReply])
    }

    return (
        <div className="space-y-1">
            {/* 评论表单 */}
            <CommentForm
                postId={postId}
                onCommentCreated={handleNewComment}
                placeholder="写下你的想法..."
            />

            {/* 评论列表 */}
            <div className="divide-y divide-border">
                {localComments.map((comment) => (
                    <CommentItem
                        className="px-4"
                        key={comment.id}
                        comment={comment}
                        onReplyCreated={handleReplyCreated}
                    />
                ))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
                <div className="text-center py-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
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