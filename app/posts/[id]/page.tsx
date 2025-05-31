"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import LexicalRenderer from "@/components/LexicalRenderer"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { CommentForm } from "@/components/comments/CommentForm"
import { CommentItem } from "@/components/comments/CommentItem"
import type { PostWithDetails, CommentWithDetails } from "@/lib/types"
import { logError } from '@/lib/debug'

export default function PostDetailsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const postId = params.id as string

    const [post, setPost] = useState<PostWithDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [comments, setComments] = useState<CommentWithDetails[]>([])

    // 获取帖子详情
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('帖子不存在')
                    } else {
                        setError('获取帖子失败')
                    }
                    return
                }

                const postData = await response.json()
                setPost(postData)

                // 设置评论数据
                if (postData.comments) {
                    setComments(postData.comments)
                }

            } catch (err) {
                logError('PostDetailsPage', err, 'Failed to fetch post')
                setError('网络错误，请重试')
            } finally {
                setLoading(false)
            }
        }

        if (postId) {
            fetchPost()
        }
    }, [postId])

    // 处理新评论创建
    const handleCommentCreated = (newComment: CommentWithDetails) => {
        setComments(prev => [newComment, ...prev])

        // 更新帖子的评论数
        if (post) {
            setPost({
                ...post,
                _count: {
                    ...post._count,
                    comments: post._count.comments + 1
                }
            })
        }
    }

    // 处理回复创建
    const handleReplyCreated = (newReply: CommentWithDetails) => {
        setComments(prev => prev.map(comment => {
            if (comment.id === newReply.parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
                    _count: {
                        ...comment._count,
                        replies: comment._count.replies + 1
                    }
                }
            }
            return comment
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto flex">
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>
                    <main className="flex-1 border-x border-border">
                        <div className="p-8 text-center">
                            <p>加载中...</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto flex">
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>
                    <main className="flex-1 border-x border-border">
                        <div className="p-8 text-center">
                            <p className="text-muted-foreground">{error || '帖子不存在'}</p>
                            <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
                                返回首页
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto flex">
                {/* 左侧边栏 */}
                <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                    <Sidebar />
                </div>

                {/* 主内容区域 */}
                <main className="flex-1 border-x border-border">
                    {/* 头部导航 */}
                    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                返回
                            </Button>
                            <h1 className="text-xl font-bold">帖子详情</h1>
                        </div>
                    </div>

                    {/* 帖子内容 */}
                    <div className="border-b border-border">
                        <div className="p-6">
                            <div className="flex space-x-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={post.author.avatarUrl || ""} />
                                    <AvatarFallback>
                                        {post.author.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold">
                                            {post.author.name || "匿名用户"}
                                        </h3>
                                        <span className="text-muted-foreground">
                                            @{post.author.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                                        </span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(post.createdAt), {
                                                addSuffix: true,
                                                locale: zhCN
                                            })}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <LexicalRenderer
                                            lexicalState={post.lexicalState}
                                            contentHtml={post.contentHtml}
                                            className="text-base leading-relaxed"
                                        />

                                        {/* 图片展示 */}
                                        {post.images.length > 0 && (
                                            <ImagePreview
                                                images={post.images.map(img => img.url)}
                                                showRemoveButton={false}
                                                onClick={(url) => window.open(url, '_blank')}
                                                className="mt-4"
                                            />
                                        )}
                                    </div>

                                    {/* 互动栏 */}
                                    <div className="flex items-center space-x-6 mt-6 pt-4 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-blue-600"
                                        >
                                            <MessageCircle className="h-5 w-5 mr-2" />
                                            {post._count.comments}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-red-600"
                                            disabled={!session}
                                        >
                                            <Heart className="h-5 w-5 mr-2" />
                                            {post._count.likes}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 评论表单 */}
                    {session && (
                        <CommentForm
                            postId={post.id}
                            onCommentCreated={handleCommentCreated}
                            placeholder="发表你的看法..."
                        />
                    )}

                    {/* 评论列表 */}
                    <div className="divide-y divide-border">
                        {comments.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>还没有评论</p>
                                <p className="text-sm">成为第一个评论的人吧！</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onReplyCreated={handleReplyCreated}
                                />
                            ))
                        )}
                    </div>
                </main>

                {/* 右侧边栏 - 可选的额外信息 */}
                <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                    <div className="p-4">
                        <div className="bg-muted rounded-xl p-4">
                            <h3 className="font-semibold mb-2">帖子统计</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>评论数：</span>
                                    <span>{post._count.comments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>点赞数：</span>
                                    <span>{post._count.likes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>发布时间：</span>
                                    <span>
                                        {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 