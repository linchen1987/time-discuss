"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"
import LexicalRenderer from "./LexicalRenderer"
import { RichTextEditor } from "./editor/RichTextEditor"
import { ImagePreview } from "@/components/ui/ImagePreview"
import type { PostWithDetails } from "@/lib/types"
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
import { debugPosts, logError } from '@/lib/debug'

interface PostCardProps {
    post: PostWithDetails
    onPostDeleted?: (postId: string) => void
    onPostUpdated?: (updatedPost: PostWithDetails) => void
}

export function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post._count.likes)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editedLexicalState, setEditedLexicalState] = useState<Record<string, unknown> | null>(post.lexicalState)
    const [editedContentHtml, setEditedContentHtml] = useState(post.contentHtml || "")
    const [editedImages, setEditedImages] = useState<string[]>(post.images.map(img => img.url) || [])

    // 检查当前用户是否是帖子作者
    const isAuthor = userId === post.author.id

    // 当 userId 可用时，重新计算点赞状态
    useEffect(() => {
        if (userId) {
            const userHasLiked = post.likes.some(like => like.userId === userId)
            setIsLiked(userHasLiked)
            debugPosts('重新计算点赞状态: postId=%s, userId=%s, userHasLiked=%s', post.id, userId, userHasLiked)
        }
    }, [userId, post.likes, post.id])

    // 跳转到详情页
    const handlePostClick = () => {
        router.push(`/posts/${post.id}`)
    }

    // 阻止按钮点击事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const handleLike = async () => {
        if (!session || isLiking) return

        setIsLiking(true)
        try {
            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '操作失败')
            }

            const result = await response.json()

            // 更新UI状态
            setIsLiked(result.liked)
            setLikeCount(prev => result.liked ? prev + 1 : prev - 1)

        } catch (error) {
            logError('PostCard', error, 'Like operation failed')
            toast.error(error instanceof Error ? error.message : '点赞失败，请重试')
        } finally {
            setIsLiking(false)
        }
    }

    const handleDelete = async () => {
        if (!session || isDeleting) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '删除失败')
            }

            toast.success('帖子已删除')

            // 通知父组件更新列表
            if (onPostDeleted) {
                onPostDeleted(post.id)
            }

        } catch (error) {
            logError('PostCard', error, 'Delete operation failed')
            toast.error(error instanceof Error ? error.message : '删除失败，请重试')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    const handleEditClick = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedLexicalState(post.lexicalState)
        setEditedContentHtml(post.contentHtml || "")
        setEditedImages(post.images.map(img => img.url) || [])
    }

    const handleSaveEdit = async () => {
        if (!session || isUpdating) return
        if (!editedLexicalState && editedImages.length === 0) return

        setIsUpdating(true)
        try {
            const response = await fetch(`/api/posts/${post.id}`, {
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
                const errorData = await response.json()
                throw new Error(errorData.error || '更新失败')
            }

            const result = await response.json()
            toast.success('帖子已更新')
            setIsEditing(false)

            // 使用回调更新父组件的数据，而不是刷新页面
            if (onPostUpdated && result.post) {
                onPostUpdated(result.post)
            }

        } catch (error) {
            logError('PostCard', error, 'Update operation failed')
            toast.error(error instanceof Error ? error.message : '更新失败，请重试')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
        setEditedLexicalState(editorState)
        setEditedContentHtml(html)
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
                            <h3 className="font-semibold text-sm">
                                {post.author.name || "匿名用户"}
                            </h3>
                            <span className="text-muted-foreground text-sm">
                                @{post.author.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                    locale: zhCN
                                })}
                            </span>
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

                        <div className="mt-2">
                            {isEditing ? (
                                <div onClick={stopPropagation}>
                                    <RichTextEditor
                                        placeholder="编辑帖子内容..."
                                        onChange={handleEditorChange}
                                        initialValue={editedContentHtml}
                                        initialImages={editedImages}
                                        onImagesChange={setEditedImages}
                                        showToolbar={true}
                                        showSubmit={false}
                                        className="border-none shadow-none min-h-[100px]"
                                    />

                                    {/* 编辑模式的控制栏 */}
                                    <div className="flex items-center justify-end mt-3 p-2 border-t">
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
                                    </div>
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

                        <div className="flex items-center space-x-6 mt-3" onClick={stopPropagation}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-blue-600"
                                onClick={handlePostClick}
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post._count.comments}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-muted-foreground hover:text-red-600 ${isLiked ? "text-red-600" : ""
                                    }`}
                                onClick={handleLike}
                                disabled={isLiking || !session}
                            >
                                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                {likeCount}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除帖子</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除这篇帖子吗？此操作无法撤销，帖子的所有内容、图片、评论和点赞都将被永久删除。
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