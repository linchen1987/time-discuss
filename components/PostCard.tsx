"use client"

import { useRouter } from "next/navigation"
import { ContentItem } from "@/components/ui/ContentItem"
import type { PostWithDetails } from "@/lib/types"

interface PostCardProps {
    post: PostWithDetails
    onPostDeleted?: (postId: string) => void
    onPostUpdated?: (updatedPost: PostWithDetails) => void
}

export function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
    const router = useRouter()

    // 跳转到详情页
    const handlePostClick = () => {
        router.push(`/posts/${post.id}`)
    }

    // 阻止按钮点击事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    // 类型安全的更新处理
    const handlePostUpdated = (updated: PostWithDetails | any) => {
        if (onPostUpdated && 'comments' in updated) {
            onPostUpdated(updated as PostWithDetails)
        }
    }

    return (
        <div className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="p-4">
                <ContentItem
                    content={post}
                    type="post"
                    onDeleted={onPostDeleted}
                    onUpdated={handlePostUpdated}
                    onClick={handlePostClick}
                    stopPropagation={stopPropagation}
                />
            </div>
        </div>
    )
} 