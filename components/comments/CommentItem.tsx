"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"
import LexicalRenderer from "../LexicalRenderer"
import { RichTextEditor } from "../editor/RichTextEditor"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { CommentForm } from "./CommentForm"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { logError } from '@/lib/debug'
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
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    const [showReplyForm, setShowReplyForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [editedLexicalState, setEditedLexicalState] = useState<Record<string, unknown> | null>(comment.lexicalState)
    const [editedContentHtml, setEditedContentHtml] = useState(comment.contentHtml || "")
    const [editedImages, setEditedImages] = useState<string[]>(comment.images?.map(img => img.url) || [])

    // 添加点赞相关状态
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(comment._count.likes)
    const [isLiking, setIsLiking] = useState(false)

    // 检查当前用户是否是评论作者
    const isAuthor = userId === comment.authorId

    // 初始化点赞状态
    useEffect(() => {
        if (userId && comment.likes) {
            const userLike = comment.likes.find(like => like.userId === userId)
            setIsLiked(!!userLike)
        }
    }, [userId, comment.likes])

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

    const handleEditClick = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedLexicalState(comment.lexicalState)
        setEditedContentHtml(comment.contentHtml || "")
        setEditedImages(comment.images?.map(img => img.url) || [])
    }

    const handleSaveEdit = async () => {
        if (!session || isUpdating) return
        if (!editedLexicalState && editedImages.length === 0) return

        setIsUpdating(true)
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lexicalState: editedLexicalState,
                    contentHtml: editedContentHtml,
                    imageUrls: editedImages,
                }),
            })

            if (!response.ok) {
                // 尝试解析错误响应
                let errorMessage = '更新失败'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch {
                    // 如果不是JSON响应（比如404 HTML页面），使用状态码提示
                    if (response.status === 404) {
                        errorMessage = '评论API接口不存在，请联系管理员'
                    } else if (response.status === 403) {
                        errorMessage = '没有权限编辑此评论'
                    } else {
                        errorMessage = `请求失败 (${response.status})`
                    }
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()
            toast.success('评论已更新')
            setIsEditing(false)

            // 通知父组件更新数据
            if (onCommentUpdated && result.comment) {
                onCommentUpdated(result.comment)
            }

        } catch (error) {
            logError('CommentItem', error, 'Update operation failed')
            toast.error(error instanceof Error ? error.message : '更新失败，请重试')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    const handleDelete = async () => {
        if (!session || isDeleting) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                // 尝试解析错误响应
                let errorMessage = '删除失败'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch {
                    // 如果不是JSON响应（比如404 HTML页面），使用状态码提示
                    if (response.status === 404) {
                        errorMessage = '评论API接口不存在，请联系管理员'
                    } else if (response.status === 403) {
                        errorMessage = '没有权限删除此评论'
                    } else {
                        errorMessage = `请求失败 (${response.status})`
                    }
                }
                throw new Error(errorMessage)
            }

            toast.success('评论已删除')

            // 通知父组件更新列表
            if (onCommentDeleted) {
                onCommentDeleted(comment.id)
            }

        } catch (error) {
            logError('CommentItem', error, 'Delete operation failed')
            toast.error(error instanceof Error ? error.message : '删除失败，请重试')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
        setEditedLexicalState(editorState)
        setEditedContentHtml(html)
    }

    const handleLike = async () => {
        if (!session || isLiking) return

        setIsLiking(true)
        try {
            const response = await fetch(`/api/comments/${comment.id}/like`, {
                method: 'POST',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '操作失败')
            }

            const result = await response.json()

            // 更新UI状态
            setIsLiked(result.liked)
            setLikeCount(result.likeCount)

        } catch (error) {
            logError('CommentItem', error, 'Like operation failed')
            toast.error(error instanceof Error ? error.message : '点赞失败，请重试')
        } finally {
            setIsLiking(false)
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

                        {/* 作者操作菜单 */}
                        {isAuthor && (
                            <div className="ml-auto" onClick={stopPropagation}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleEditClick}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            编辑
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={handleDeleteClick}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {isDeleting ? '删除中...' : '删除'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
                                                disabled={isUpdating || (!editedLexicalState && editedImages.length === 0)}
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
                                className={`text-muted-foreground hover:text-red-600 ${isLiked ? 'text-red-600' : ''}`}
                                onClick={handleLike}
                                disabled={!session || isLiking}
                            >
                                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                                {likeCount}
                            </Button>
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
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除评论</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除这条评论吗？此操作无法撤销，评论的所有内容、图片和点赞都将被永久删除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? '删除中...' : '确认删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 