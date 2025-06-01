"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import LexicalRenderer from "../LexicalRenderer"
import { RichTextEditor } from "../editor/RichTextEditor"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { UserInfo } from "@/components/ui/UserInfo"
import { ActionMenu } from "@/components/ui/ActionMenu"
import { DeleteDialog } from "@/components/ui/DeleteDialog"
import { LikeUsersList } from "@/components/ui/LikeUsersList"
import { useLike } from "@/hooks/useLike"
import { useEdit } from "@/hooks/useEdit"
import { useDelete } from "@/hooks/useDelete"
import type { PostWithDetails, CommentWithDetails } from "@/lib/types"

interface ContentItemProps {
    content: PostWithDetails | CommentWithDetails
    type: 'post' | 'comment'
    onDeleted?: (id: string) => void
    onUpdated?: (updated: PostWithDetails | CommentWithDetails) => void
    onReplyClick?: () => void
    onClick?: () => void
    className?: string
    showReplyButton?: boolean
    stopPropagation?: (e: React.MouseEvent) => void
    children?: React.ReactNode // 用于插入额外内容，如回复表单
}

export function ContentItem({
    content,
    type,
    onDeleted,
    onUpdated,
    onReplyClick,
    onClick,
    className = "",
    showReplyButton = false,
    stopPropagation,
    children
}: ContentItemProps) {
    const { data: session } = useSession()
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    // 检查当前用户是否是作者
    const isAuthor = userId === content.authorId || userId === content.author.id

    // 使用自定义 hooks
    const {
        isLiked,
        likeCount,
        isLiking,
        likes,
        handleLike,
        canLike
    } = useLike({
        initialLikes: content.likes || [],
        initialCount: content._count.likes,
        entityId: content.id,
        entityType: type
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
    } = useEdit<PostWithDetails | CommentWithDetails>({
        entityId: content.id,
        entityType: type,
        initialLexicalState: content.lexicalState,
        initialContentHtml: content.contentHtml || "",
        initialImages: content.images?.map(img => img.url) || [],
        onUpdated: onUpdated
    })

    const {
        isDeleting,
        showDeleteDialog,
        setShowDeleteDialog,
        handleDeleteClick,
        handleDelete: performDelete
    } = useDelete({
        entityId: content.id,
        entityType: type,
        onDeleted
    })

    const handleContentClick = () => {
        if (showDeleteDialog || isEditing) return
        onClick?.()
    }

    const defaultStopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const finalStopPropagation = stopPropagation || defaultStopPropagation

    // 类型守卫
    const isPost = (content: PostWithDetails | CommentWithDetails): content is PostWithDetails => {
        return type === 'post'
    }

    const commentCount = isPost(content) ? content._count.comments : undefined

    return (
        <div
            className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={handleContentClick}
        >
            <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={content.author.avatarUrl || ""} />
                    <AvatarFallback>
                        {content.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <UserInfo
                            user={content.author}
                            createdAt={content.createdAt}
                            replyToUser={type === 'comment' ? (content as CommentWithDetails).replyToUser : undefined}
                            size="sm"
                            showAvatar={false}
                        />

                        {/* 作者操作菜单 */}
                        {isAuthor && (
                            <ActionMenu
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                isDeleting={isDeleting}
                                stopPropagation={finalStopPropagation}
                            />
                        )}
                    </div>

                    {/* 内容区域 */}
                    <div className="mt-2">
                        {isEditing ? (
                            <div onClick={finalStopPropagation}>
                                <RichTextEditor
                                    placeholder={`编辑${type === 'post' ? '帖子' : '评论'}内容...`}
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
                                {content.lexicalState ? (
                                    <LexicalRenderer
                                        lexicalState={content.lexicalState}
                                        contentHtml={content.contentHtml}
                                        className={`text-sm ${type === 'post' ? 'whitespace-pre-wrap' : ''}`}
                                    />
                                ) : (
                                    <p className="text-sm">{type === 'comment' ? (content as CommentWithDetails).content : ''}</p>
                                )}

                                {/* 图片展示 */}
                                {content.images && content.images.length > 0 && (
                                    <div className="mt-3">
                                        <ImagePreview
                                            images={content.images.map(img => img.url)}
                                            className={type === 'comment' ? "max-w-md" : ""}
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
                        <div className="flex items-center space-x-4 mt-3 -ml-2" onClick={finalStopPropagation}>
                            {/* 回复或评论按钮 */}
                            {showReplyButton && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-blue-600"
                                    onClick={onReplyClick}
                                    disabled={!session}
                                >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {type === 'post' ? commentCount : '回复'}
                                </Button>
                            )}

                            {/* 如果是帖子且有评论数，显示评论按钮 */}
                            {type === 'post' && !showReplyButton && commentCount !== undefined && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-blue-600"
                                    onClick={onClick}
                                >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {commentCount}
                                </Button>
                            )}

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
                        <div className="mt-0" onClick={finalStopPropagation}>
                            <LikeUsersList
                                likes={likes}
                                isLiked={isLiked}
                                likeCount={likeCount}
                                showInline={true}
                                onlyUsersList={true}
                            />
                        </div>
                    )}

                    {/* 额外内容，如回复表单 */}
                    {children}
                </div>
            </div>

            {/* 删除确认对话框 */}
            <DeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={performDelete}
                isDeleting={isDeleting}
                entityType={type}
            />
        </div>
    )
} 