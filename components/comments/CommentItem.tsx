"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import LexicalRenderer from "../LexicalRenderer"
import { RichTextEditor } from "../editor/RichTextEditor"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { CommentForm } from "./CommentForm"
import { UserInfo } from "@/components/ui/UserInfo"
import { ActionMenu } from "@/components/ui/ActionMenu"
import { DeleteDialog } from "@/components/ui/DeleteDialog"
import { LikeUsersList } from "@/components/ui/LikeUsersList"
import type { CommentWithDetails } from "@/lib/types"
import { useLike } from "@/hooks/useLike"
import { useEdit } from "@/hooks/useEdit"
import { useDelete } from "@/hooks/useDelete"

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
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    const [showReplyForm, setShowReplyForm] = useState(false)

    // 检查当前用户是否是评论作者
    const isAuthor = userId === comment.authorId

    // 使用自定义 hooks
    const {
        isLiked,
        likeCount,
        isLiking,
        likes,
        handleLike,
        canLike
    } = useLike({
        initialLikes: comment.likes || [],
        initialCount: comment._count.likes,
        entityId: comment.id,
        entityType: 'comment'
    })

    const {
        isEditing,
        isUpdating,
        editedContentHtml,
        editedImages,
        setEditedImages,
        handleEditClick,
        handleCancelEdit,
        handleSaveEdit,
        handleEditorChange,
        hasChanges
    } = useEdit<CommentWithDetails>({
        entityId: comment.id,
        entityType: 'comment',
        initialLexicalState: comment.lexicalState,
        initialContentHtml: comment.contentHtml || "",
        initialImages: comment.images?.map(img => img.url) || [],
        onUpdated: onCommentUpdated
    })

    const {
        isDeleting,
        showDeleteDialog,
        setShowDeleteDialog,
        handleDeleteClick,
        handleDelete: performDelete
    } = useDelete({
        entityId: comment.id,
        entityType: 'comment',
        onDeleted: onCommentDeleted
    })

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
            <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatarUrl || ""} />
                    <AvatarFallback>
                        {comment.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <UserInfo
                            user={comment.author}
                            createdAt={comment.createdAt}
                            replyToUser={comment.replyToUser}
                            size="sm"
                            showAvatar={false}
                        />

                        {/* 作者操作菜单 */}
                        {isAuthor && (
                            <ActionMenu
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                isDeleting={isDeleting}
                                stopPropagation={stopPropagation}
                            />
                        )}
                    </div>

                    {/* 评论内容 */}
                    <div className="mt-2">
                        {isEditing ? (
                            <div onClick={stopPropagation}>
                                <RichTextEditor
                                    placeholder="编辑评论内容..."
                                    onChange={handleEditorChange}
                                    onSubmit={handleSaveEdit}
                                    initialValue={editedContentHtml}
                                    initialImages={editedImages}
                                    onImagesChange={setEditedImages}
                                    showToolbar={true}
                                    showSubmit={false}
                                    className="border-none shadow-none min-h-[80px]"
                                    customActions={
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={isUpdating}
                                            >
                                                取消
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating || !hasChanges}
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                        更新中...
                                                    </>
                                                ) : (
                                                    '保存'
                                                )}
                                            </Button>
                                        </div>
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                {comment.lexicalState ? (
                                    <LexicalRenderer
                                        lexicalState={comment.lexicalState}
                                        contentHtml={comment.contentHtml}
                                        className="text-sm"
                                    />
                                ) : (
                                    <p className="text-sm">{comment.content}</p>
                                )}

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
                            </>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    {!isEditing && (
                        <div className="flex items-center space-x-4 mt-3 -ml-2">
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

                            <LikeUsersList
                                likes={likes}
                                isLiked={isLiked}
                                likeCount={likeCount}
                                onLike={handleLike}
                                disabled={!canLike || isLiking}
                                variant="ghost"
                                size="sm"
                                onlyButton={true}
                            />
                        </div>
                    )}

                    {/* 点赞用户列表 */}
                    {!isEditing && (
                        <div className="mt-0">
                            <LikeUsersList
                                likes={likes}
                                isLiked={isLiked}
                                likeCount={likeCount}
                                showInline={true}
                                onlyUsersList={true}
                            />
                        </div>
                    )}
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

            {/* 删除确认对话框 */}
            <DeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={performDelete}
                isDeleting={isDeleting}
                entityType="comment"
            />
        </div>
    )
} 