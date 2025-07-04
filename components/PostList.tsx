"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PostCard } from "@/components/PostCard"
import type { PostWithDetails } from "@/lib/types"
import { logError } from '@/lib/debug'

interface PostListProps {
    onPostCreated?: (post: PostWithDetails) => void
    newPost?: PostWithDetails | null // 从外部传入的新帖子
}

interface PaginatedResponse {
    data: PostWithDetails[]
    pagination: {
        hasMore: boolean
        nextCursor?: string
    }
}

export function PostList({ onPostCreated, newPost }: PostListProps) {
    const [posts, setPosts] = useState<PostWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadingElementRef = useRef<HTMLDivElement | null>(null)

    // 获取帖子列表
    const fetchPosts = useCallback(async (cursor?: string, isLoadMore = false) => {
        try {
            const url = new URL('/api/posts', window.location.origin)
            if (cursor) {
                url.searchParams.set('cursor', cursor)
            }
            url.searchParams.set('limit', '20')

            const response = await fetch(url.toString())
            if (response.ok) {
                const data: PaginatedResponse = await response.json()

                if (isLoadMore) {
                    setPosts(prev => [...prev, ...data.data])
                } else {
                    setPosts(data.data)
                }

                setHasMore(data.pagination.hasMore)
                setNextCursor(data.pagination.nextCursor || null)
            }
        } catch (error) {
            logError('PostList', error, 'Failed to fetch posts')
        } finally {
            if (isLoadMore) {
                setLoadingMore(false)
            } else {
                setLoading(false)
            }
        }
    }, [])

    // 初始加载
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    // 加载更多数据
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !nextCursor) return

        setLoadingMore(true)
        await fetchPosts(nextCursor, true)
    }, [fetchPosts, loadingMore, hasMore, nextCursor])

    // 设置 Intersection Observer
    useEffect(() => {
        if (!loadingElementRef.current || !hasMore) return

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting) {
                    loadMore()
                }
            },
            {
                threshold: 0.1,
                rootMargin: '20px',
            }
        )

        observerRef.current.observe(loadingElementRef.current)

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [loadMore, hasMore])

    // 清理 observer
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [])

    // 处理新帖子创建
    useEffect(() => {
        if (newPost) {
            setPosts(prev => [newPost, ...prev])
            if (onPostCreated) {
                onPostCreated(newPost)
            }
        }
    }, [newPost, onPostCreated])

    // 处理帖子删除
    const handlePostDeleted = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId))
    }

    // 处理帖子更新
    const handlePostUpdated = (updatedPost: PostWithDetails) => {
        setPosts(prev => prev.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        ))
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>加载中...</p>
            </div>
        )
    }

    return (
        <div>
            {posts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <p>还没有任何帖子</p>
                    <p className="text-sm mt-1">成为第一个分享的人吧！</p>
                </div>
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onPostDeleted={handlePostDeleted}
                            onPostUpdated={handlePostUpdated}
                        />
                    ))}

                    {/* 加载更多触发器 */}
                    {hasMore && (
                        <div
                            ref={loadingElementRef}
                            className="p-8 text-center text-muted-foreground"
                        >
                            {loadingMore ? (
                                <p>正在加载更多...</p>
                            ) : (
                                <p>滚动到底部加载更多</p>
                            )}
                        </div>
                    )}

                    {/* 没有更多数据的提示 */}
                    {!hasMore && posts.length > 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">我是有底线的～</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
} 