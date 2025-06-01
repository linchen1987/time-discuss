"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Layout } from "@/components/Layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle, Home, Settings } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import LexicalRenderer from "@/components/LexicalRenderer"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { CommentList } from "@/components/comments/CommentList"
import { CommentForm } from "@/components/comments/CommentForm"
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

    const handleNewComment = (newComment: CommentWithDetails) => {
        setComments(prev => [...prev, newComment])
    }

    if (loading) {
        return (
            <Layout title="帖子详情">
                <div className="p-8 text-center">
                    <p>加载中...</p>
                </div>
            </Layout>
        )
    }

    if (error || !post) {
        return (
            <Layout title="帖子详情">
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">{error || '帖子不存在'}</p>
                    <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
                        返回首页
                    </Button>
                </div>
            </Layout>
        )
    }

    const rightSidebarContent = (
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
    )

    // 自定义标题区域，包含返回按钮
    const customTitle = (
        <div className="flex items-center">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="-ml-2 mr-3"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">帖子详情</h1>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            {/* 桌面端布局 */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto flex">
                    {/* 左侧边栏 */}
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <div className="w-full p-4">
                            <div className="space-y-4">
                                {/* Logo */}
                                <div className="px-3 py-2">
                                    <h1 className="text-xl font-bold">朋友之家</h1>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-4">
                                    <div>
                                        <Button variant="ghost" className="w-full justify-start items-center text-md cursor-pointer" size="lg" onClick={() => router.push('/')}>
                                            <Home className="mr-2 size-5" />
                                            首页
                                        </Button>
                                    </div>
                                    <div>
                                        <Button variant="ghost" className="w-full justify-start items-center text-md cursor-pointer" size="lg" onClick={() => router.push('/settings')}>
                                            <Settings className="mr-2 size-5" />
                                            设置
                                        </Button>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* 主内容区域 */}
                    <main className="flex-1 border-x border-border">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-40">
                            {customTitle}
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

                        {/* 评论表单 */}
                        <div className="border-b border-border">
                            <CommentForm
                                postId={post.id}
                                onCommentCreated={handleNewComment}
                                placeholder="写下你的想法..."
                            />
                        </div>

                        {/* 评论区域 */}
                        <CommentList
                            comments={comments}
                            loading={false}
                        />
                    </main>

                    {/* 右侧边栏 */}
                    <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                        {rightSidebarContent}
                    </div>
                </div>
            </div>

            {/* 移动端布局 */}
            <div className="md:hidden">
                <main className="pb-12">
                    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-40">
                        {customTitle}
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

                    {/* 评论表单 */}
                    <div className="border-b border-border">
                        <CommentForm
                            postId={post.id}
                            onCommentCreated={handleNewComment}
                            placeholder="写下你的想法..."
                        />
                    </div>

                    {/* 评论区域 */}
                    <CommentList
                        comments={comments}
                        loading={false}
                    />
                </main>

                {/* 移动端底部导航 */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 md:hidden">
                    <nav className="flex justify-center">
                        <div className="flex items-center justify-center gap-6 w-full max-w-md py-2">
                            <Button
                                variant="ghost"
                                className="flex flex-col items-center justify-center p-2 transition-colors text-muted-foreground hover:text-foreground"
                                onClick={() => router.push('/')}
                            >
                                <Home className="h-5 w-5 mb-0.5" />
                                <span className="text-xs font-medium">首页</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex flex-col items-center justify-center p-2 transition-colors text-muted-foreground hover:text-foreground"
                                onClick={() => router.push('/settings')}
                            >
                                <Settings className="h-5 w-5 mb-0.5" />
                                <span className="text-xs font-medium">设置</span>
                            </Button>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    )
} 