"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/PostCard"
import type { PostWithDetails } from "@/lib/types"

export function PostList() {
    const [posts, setPosts] = useState<PostWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    // 获取帖子列表
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts')
                if (response.ok) {
                    const data = await response.json()
                    setPosts(data)
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [])

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
                posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                    />
                ))
            )}
        </div>
    )
} 