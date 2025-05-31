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
    onReplyCreated?: (comment: CommentWithDetails) => void
    className?: string
}

export function CommentItem({
    comment,
    onReplyCreated,
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

    return (
        <div className={`py-3 ${className}`}>
            <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
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

                    {/* 评论内容 */}
                    <div className="mt-2">
                        {comment.lexicalState ? (
                            <LexicalRenderer
                                lexicalState={comment.lexicalState}
                                contentHtml={comment.contentHtml}
                                className="text-sm"
                            />
                        ) : (
                            <p className="text-sm">{comment.content}</p>
                        )}
                    </div>

                    {/* 图片展示 */}
                    {comment.images && comment.images.length > 0 && (
                        <div className="mt-3">
                            <ImagePreview
                                images={comment.images.map(img => img.url)}
                                className="max-w-md"
                                showRemoveButton={false}
                                onClick={(url) => window.open(url, '_blank')}
                            />
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-4 mt-3">
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
        </div>
    )
} 