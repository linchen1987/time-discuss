"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Image from "next/image"
import { toast } from "sonner"
import LexicalRenderer from "./LexicalRenderer"
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

interface PostCardProps {
    post: {
        id: string
        lexicalState: Record<string, unknown> | null
        contentHtml: string | null
        createdAt: Date
        author: {
            id: string
            name: string | null
            avatarUrl: string | null
        }
        images?: Array<{
            id: string
            url: string
            altText: string | null
        }>
        _count: {
            likes: number
            comments: number
        }
        likes: Array<{
            id: string
            userId: string
            user: {
                id: string
                name: string | null
                username: string | null
            }
        }>
    }
    onPostDeleted?: (postId: string) => void
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
    const { data: session } = useSession()
    const userId = session?.user ? (session.user as { id: string }).id : undefined

    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post._count.likes)
    const [isLiking, setIsLiking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // 检查当前用户是否是帖子作者
    const isAuthor = userId === post.author.id

    // 当 userId 可用时，重新计算点赞状态
    useEffect(() => {
        if (userId) {
            const userHasLiked = post.likes.some(like => like.userId === userId)
            setIsLiked(userHasLiked)
            console.log('重新计算点赞状态:', {
                postId: post.id,
                userId: userId,
                userHasLiked: userHasLiked,
                likesArray: post.likes
            })
        }
    }, [userId, post.likes, post.id])

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
            console.error('Like error:', error)
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
            console.error('Delete error:', error)
            toast.error(error instanceof Error ? error.message : '删除失败，请重试')
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    // 根据图片数量决定布局
    const getImageLayout = (imageCount: number) => {
        if (imageCount === 1) return "grid-cols-1"
        if (imageCount === 2) return "grid-cols-2"
        if (imageCount === 3) return "grid-cols-2"
        if (imageCount === 4) return "grid-cols-2"
        return "grid-cols-3"
    }

    const getImageHeight = (imageCount: number, index: number) => {
        if (imageCount === 1) return "h-64"
        if (imageCount === 3 && index === 0) return "h-64"
        return "h-32"
    }

    const getImageSpan = (imageCount: number, index: number) => {
        if (imageCount === 3 && index === 0) return "col-span-2"
        return ""
    }

    return (
        <div className="border-b border-border hover:bg-muted/50 transition-colors">
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
                                <div className="ml-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem disabled>
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
                            <LexicalRenderer
                                lexicalState={post.lexicalState}
                                contentHtml={post.contentHtml}
                                className="text-sm whitespace-pre-wrap"
                            />
                        </div>

                        {/* 图片展示区域 */}
                        {post.images && post.images.length > 0 && (
                            <div className={`mt-3 grid gap-2 ${getImageLayout(post.images.length)}`}>
                                {post.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={`relative overflow-hidden rounded-lg ${getImageSpan(post.images!.length, index)}`}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.altText || `图片 ${index + 1}`}
                                            width={400}
                                            height={300}
                                            className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${getImageHeight(post.images!.length, index)}`}
                                            onClick={() => {
                                                // TODO: 实现图片预览功能
                                                window.open(image.url, '_blank')
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center space-x-6 mt-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-blue-600"
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