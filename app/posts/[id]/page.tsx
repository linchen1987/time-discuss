"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ContentItem } from "@/components/ui/ContentItem"
import { CommentList } from "@/components/comments/CommentList"
import { CommentForm } from "@/components/comments/CommentForm"
import type { PostWithDetails, CommentWithDetails } from "@/lib/types"
import { logError } from '@/lib/debug'

export default function PostDetailsPage() {
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

    const handlePostDeleted = () => {
        // 帖子被删除后返回首页
        router.push('/')
    }

    // 修复类型错误：明确处理 PostWithDetails 类型
    const handlePostUpdated = (updated: PostWithDetails | CommentWithDetails) => {
        // 确保更新的是帖子，而不是评论
        if ('comments' in updated) {
            setPost(updated as PostWithDetails)
        }
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
        <Layout
            titleContent={customTitle}
            showRightSidebar={true}
            rightSidebarContent={rightSidebarContent}
        >
            {/* 帖子内容 */}
            <div className="border-b border-border p-4">
                <ContentItem
                    content={post}
                    type="post"
                    onDeleted={handlePostDeleted}
                    onUpdated={handlePostUpdated}
                    className="text-base"
                />
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
        </Layout>
    )
} 