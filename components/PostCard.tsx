"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface PostCardProps {
    post: {
        id: string
        contentHtml: string | null
        createdAt: Date
        author: {
            id: string
            name: string | null
            avatarUrl: string | null
        }
        _count: {
            likes: number
            comments: number
        }
        likes: Array<{ userId: string }>
    }
}

export function PostCard({ post }: PostCardProps) {
    const { data: session } = useSession()
    const userId = session?.user ? (session.user as { id: string }).id : undefined
    const [isLiked, setIsLiked] = useState(
        post.likes.some(like => like.userId === userId)
    )
    const [likeCount, setLikeCount] = useState(post._count.likes)

    const handleLike = async () => {
        // TODO: 实现点赞功能
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
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
                            <div className="ml-auto">
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-2">
                            <p className="text-sm whitespace-pre-wrap">
                                {post.contentHtml || ""}
                            </p>
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
                            >
                                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                {likeCount}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 