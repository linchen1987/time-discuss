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
import { CommentList } from "@/components/comments/CommentList"
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
                    {/* 返回按钮 */}
                    <div className="sticky top-0 z-10 bg-background border-b border-border">
                        <div className="flex items-center p-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="-ml-2 mr-4"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-lg font-semibold">帖子详情</h1>
                        </div>
                    </div>

                    {/* 帖子内容 */}
                    <div className="border-b border-border">
                        <div className="p-4">
                            <div className="flex space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.author.avatarUrl || ""} />
                                    <AvatarFallback>
                                        {post.author.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <h2 className="font-semibold">
                                            {post.author.name || "匿名用户"}
                                        </h2>
                                        <span className="text-muted-foreground text-sm">
                                            @{post.author.username || post.author.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                                        </span>
                                        <span className="text-muted-foreground text-sm">·</span>
                                        <span className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(post.createdAt), {
                                                addSuffix: true,
                                                locale: zhCN
                                            })}
                                        </span>
                                    </div>

                                    {/* 帖子内容 */}
                                    <div className="mb-4">
                                        <LexicalRenderer
                                            lexicalState={post.lexicalState}
                                            contentHtml={post.contentHtml}
                                            className="text-base whitespace-pre-wrap"
                                        />
                                    </div>

                                    {/* 图片展示 */}
                                    {post.images.length > 0 && (
                                        <div className="mb-4">
                                            <ImagePreview
                                                images={post.images.map(img => img.url)}
                                                showRemoveButton={false}
                                                onClick={(url) => window.open(url, '_blank')}
                                            />
                                        </div>
                                    )}

                                    {/* 统计信息 */}
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

                    {/* 评论区域 */}
                    <CommentList
                        postId={post.id}
                        comments={comments}
                        loading={false}
                    />
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