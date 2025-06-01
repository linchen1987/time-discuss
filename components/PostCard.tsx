"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import LexicalRenderer from "./LexicalRenderer"
import { RichTextEditor } from "./editor/RichTextEditor"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { UserInfo } from "@/components/ui/UserInfo"
import { ActionMenu } from "@/components/ui/ActionMenu"
import { DeleteDialog } from "@/components/ui/DeleteDialog"
import { LikeUsersList } from "@/components/ui/LikeUsersList"
import type { PostWithDetails } from "@/lib/types"
import { useLike } from "@/hooks/useLike"
import { useEdit } from "@/hooks/useEdit"
import { useDelete } from "@/hooks/useDelete"

interface PostCardProps {
    post: PostWithDetails
    onPostDeleted?: (postId: string) => void
    onPostUpdated?: (updatedPost: PostWithDetails) => void
}

export function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    // 检查当前用户是否是帖子作者
    const isAuthor = userId === post.author.id

    // 使用自定义 hooks
    const {
        isLiked,
        likeCount,
        isLiking,
        likes,
        handleLike,
        canLike
    } = useLike({
        initialLikes: post.likes || [],
        initialCount: post._count.likes,
        entityId: post.id,
        entityType: 'post'
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
    } = useEdit<PostWithDetails>({
        entityId: post.id,
        entityType: 'post',
        initialLexicalState: post.lexicalState,
        initialContentHtml: post.contentHtml || "",
        initialImages: post.images.map(img => img.url) || [],
        onUpdated: onPostUpdated
    })

    const {
        isDeleting,
        showDeleteDialog,
        setShowDeleteDialog,
        handleDeleteClick,
        handleDelete: performDelete
    } = useDelete({
        entityId: post.id,
        entityType: 'post',
        onDeleted: onPostDeleted
    })

    // 跳转到详情页
    const handlePostClick = () => {
        // 如果删除对话框正在显示，则不跳转
        if (showDeleteDialog) {
            return
        }
        router.push(`/posts/${post.id}`)
    }

    // 阻止按钮点击事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={handlePostClick}
        >
            <div className="p-4">
                <div className="flex space-x-3">
                    <Avatar>
                        <AvatarImage src={post.author.avatarUrl || ""} />
                        <AvatarFallback>
                            {post.author.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <UserInfo
                                user={post.author}
                                createdAt={post.createdAt}
                                size="sm"
                                showAvatar={false}
                            />

                            {isAuthor && (
                                <ActionMenu
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                    isDeleting={isDeleting}
                                    stopPropagation={stopPropagation}
                                />
                            )}
                        </div>

                        <div className="mt-2">
                            {isEditing ? (
                                <div onClick={stopPropagation}>
                                    <RichTextEditor
                                        placeholder="编辑帖子内容..."
                                        onChange={handleEditorChange}
                                        onSubmit={handleSaveEdit}
                                        initialValue={editedContentHtml}
                                        initialImages={editedImages}
                                        onImagesChange={setEditedImages}
                                        showToolbar={true}
                                        showSubmit={false}
                                        className="border-none shadow-none min-h-[100px]"
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
                                    <LexicalRenderer
                                        lexicalState={post.lexicalState}
                                        contentHtml={post.contentHtml}
                                        className="text-sm whitespace-pre-wrap"
                                    />

                                    {/* 图片展示区域 */}
                                    <ImagePreview
                                        images={post.images.map(img => img.url)}
                                        showRemoveButton={false}
                                        onClick={(url) => window.open(url, '_blank')}
                                        className="mt-3"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex items-center space-x-6 mt-3 -ml-2" onClick={stopPropagation}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-blue-600"
                                onClick={handlePostClick}
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post._count.comments}
                            </Button>

                            <LikeUsersList
                                likes={likes}
                                isLiked={isLiked}
                                likeCount={likeCount}
                                onLike={handleLike}
                                disabled={isLiking || !canLike}
                                variant="ghost"
                                size="sm"
                                onlyButton={true}
                            />
                        </div>

                        {/* 点赞用户列表 */}
                        <div className="mt-2" onClick={stopPropagation}>
                            <LikeUsersList
                                likes={likes}
                                isLiked={isLiked}
                                likeCount={likeCount}
                                showInline={true}
                                onlyUsersList={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={performDelete}
                isDeleting={isDeleting}
                entityType="post"
            />
        </div>
    )
} 