"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import LexicalRenderer from "../LexicalRenderer"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { CommentForm } from "./CommentForm"
import type { CommentWithDetails } from "@/lib/types"

interface CommentItemProps {
    comment: CommentWithDetails
    level?: number // 嵌套层级，用于控制缩进
    maxLevel?: number // 最大嵌套层级
    onCommentUpdated?: (comment: CommentWithDetails) => void
    onCommentDeleted?: (commentId: string) => void
    onReplyCreated?: (comment: CommentWithDetails) => void
}

export function CommentItem({
    comment,
    level = 0,
    maxLevel = 1, // 限制为二层结构
    onCommentUpdated,
    onCommentDeleted,
    onReplyCreated
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

    // 是否是顶级评论
    const isTopLevel = !comment.parentId

    return (
        <div className={`${level > 0 ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
            <div className="py-3">
                <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatarUrl || ""} />
                        <AvatarFallback>
                            {comment.author.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-sm">
                                {comment.author.name || "匿名用户"}
                            </h4>
                            <span className="text-muted-foreground text-sm">
                                @{comment.author.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                    addSuffix: true,
                                    locale: zhCN
                                })}
                            </span>

                            {/* 如果是回复，显示回复对象 */}
                            {comment.replyToUser && (
                                <>
                                    <span className="text-muted-foreground text-sm">回复</span>
                                    <span className="text-blue-600 text-sm">
                                        @{comment.replyToUser.name}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="mt-2">
                            <LexicalRenderer
                                lexicalState={comment.lexicalState}
                                contentHtml={comment.contentHtml}
                                className="text-sm whitespace-pre-wrap"
                            />

                            {/* 图片展示区域 */}
                            {comment.images.length > 0 && (
                                <ImagePreview
                                    images={comment.images.map(img => img.url)}
                                    showRemoveButton={false}
                                    onClick={(url) => window.open(url, '_blank')}
                                    className="mt-3"
                                />
                            )}
                        </div>

                        <div className="flex items-center space-x-4 mt-3">
                            {/* 回复按钮 - 只在顶级评论显示，且当前层级未达到最大值 */}
                            {isTopLevel && level < maxLevel && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-blue-600"
                                    onClick={handleReplyClick}
                                    disabled={!session}
                                >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    回复
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-red-600"
                                disabled={!session}
                            >
                                <Heart className="h-4 w-4 mr-1" />
                                {comment._count.likes}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 回复表单 */}
            {showReplyForm && (
                <div className="mt-2">
                    <CommentForm
                        postId={comment.postId}
                        parentId={comment.id}
                        replyToUser={{
                            id: comment.author.id,
                            name: comment.author.name || '匿名用户'
                        }}
                        onCommentCreated={handleReplyCreated}
                        onCancel={handleCancelReply}
                        compact={true}
                    />
                </div>
            )}

            {/* 回复列表 */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            level={level + 1}
                            maxLevel={maxLevel}
                            onCommentUpdated={onCommentUpdated}
                            onCommentDeleted={onCommentDeleted}
                            onReplyCreated={onReplyCreated}
                        />
                    ))}
                </div>
            )}
        </div>
    )
} 