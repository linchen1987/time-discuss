"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, X, ImagePlus, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Image from "next/image"
import { toast } from "sonner"
import LexicalRenderer from "./LexicalRenderer"
import LexicalEditor from "./editor/LexicalEditor"
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
    const [isUploadingInEdit, setIsUploadingInEdit] = useState(false)

    // 检查当前用户是否是帖子作者
    const isAuthor = userId === post.author.id

    // 文件输入引用
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 当 userId 可用时，重新计算点赞状态
    useEffect(() => {
        if (userId) {
            const userHasLiked = post.likes.some(like => like.userId === userId)
            setIsLiked(userHasLiked)
            debugPosts('重新计算点赞状态: postId=%s, userId=%s, userHasLiked=%s', post.id, userId, userHasLiked)
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

    const handleImageUpload = async (files: FileList) => {
        if (files.length === 0) return

        const fileArray = Array.from(files)
        if (editedImages.length + fileArray.length > 9) {
            toast.error('最多上传9张图片')
            return
        }

        setIsUploadingInEdit(true)
        try {
            const formData = new FormData()
            fileArray.forEach(file => {
                formData.append('files', file)
            })

            const response = await fetch('/api/uploads/post-images', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '上传失败')
            }

            const data = await response.json()
            setEditedImages(prev => [...prev, ...data.urls])
            toast.success('图片上传成功')
        } catch (error) {
            logError('PostCard', error, 'Image upload failed during edit')
            toast.error(error instanceof Error ? error.message : '图片上传失败')
        } finally {
            setIsUploadingInEdit(false)
        }
    }

    const removeEditImage = (index: number) => {
        setEditedImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            handleImageUpload(files)
        }
        e.target.value = ''
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
                                <div>
                                    <LexicalEditor
                                        placeholder="编辑帖子内容..."
                                        onChange={handleEditorChange}
                                        initialValue={editedContentHtml}
                                        showToolbar={false}
                                        className="border-none shadow-none min-h-[100px]"
                                        onSubmit={handleSaveEdit}
                                        onImagePaste={(files) => {
                                            // 将 File[] 转换为 FileList
                                            const fileList = {
                                                length: files.length,
                                                item: (index: number) => files[index] || null,
                                                [Symbol.iterator]: function* () {
                                                    for (let i = 0; i < files.length; i++) {
                                                        yield files[i]
                                                    }
                                                }
                                            } as FileList
                                            handleImageUpload(fileList)
                                        }}
                                    />

                                    {/* 编辑模式的图片预览 */}
                                    {editedImages.length > 0 && (
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            {editedImages.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <Image
                                                        src={url}
                                                        alt={`编辑图片 ${index + 1}`}
                                                        width={200}
                                                        height={200}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEditImage(index)}
                                                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 编辑模式的工具栏 */}
                                    <div className="flex items-center justify-between mt-3 p-2 border-t">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={editedImages.length >= 9 || isUploadingInEdit}
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                {isUploadingInEdit ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <ImagePlus className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {editedImages.length}/9 图片
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={isUpdating || isUploadingInEdit}
                                            >
                                                取消
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                disabled={isUpdating || isUploadingInEdit || (!editedLexicalState && editedImages.length === 0)}
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
                                    {post.images.length > 0 && (
                                        <div className={`mt-3 grid gap-2 ${getImageLayout(post.images.length)}`}>
                                            {post.images.map((image, index) => (
                                                <div
                                                    key={image.id}
                                                    className={`relative overflow-hidden rounded-lg ${getImageSpan(post.images.length, index)}`}
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={image.altText || `图片 ${index + 1}`}
                                                        width={400}
                                                        height={300}
                                                        className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${getImageHeight(post.images.length, index)}`}
                                                        onClick={() => {
                                                            // TODO: 实现图片预览功能
                                                            window.open(image.url, '_blank')
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

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