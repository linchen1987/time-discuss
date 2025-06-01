"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface LikeUser {
    id: string;
    name: string | null;
    username: string | null;
}

interface LikeUsersListProps {
    likes: {
        id: string;
        userId: string;
        user: LikeUser;
    }[];
    isLiked: boolean;
    likeCount: number;
    onLike?: () => void;
    disabled?: boolean;
    showInline?: boolean; // 是否在内联模式下显示点赞用户（用于详情页）
    variant?: "ghost" | "default" | "outline";
    size?: "sm" | "lg" | "default";
    onlyButton?: boolean; // 只显示按钮，不显示用户列表
    onlyUsersList?: boolean; // 只显示用户列表，不显示按钮
    className?: string;
}

export function LikeUsersList({
    likes,
    isLiked,
    likeCount,
    onLike,
    disabled = false,
    showInline = false,
    variant = "ghost",
    size = "sm",
    onlyButton = false,
    onlyUsersList = false,
    className = ""
}: LikeUsersListProps) {
    const [showAll, setShowAll] = useState(false)

    const getUserDisplayName = (user: LikeUser) => {
        return user.name || user.username || "匿名用户"
    }

    const heartClassName = `h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`
    const buttonClassName = `text-muted-foreground hover:text-red-600 ${isLiked ? "text-red-600" : ""}`

    // 只显示点赞按钮
    if (onlyButton) {
        return (
            <Button
                variant={variant}
                size={size}
                className={buttonClassName}
                onClick={onLike}
                disabled={disabled}
            >
                <Heart className={heartClassName} />
                {likeCount}
            </Button>
        )
    }

    // 只显示用户列表
    if (onlyUsersList) {
        if (!showInline || likes.length === 0) return null

        const maxInlineDisplay = 3
        const displayedUsers = showAll ? likes : likes.slice(0, maxInlineDisplay)
        const remainingCount = likes.length - maxInlineDisplay

        return (
            <div className={`text-xs text-muted-foreground ${className}`}>
                <span>
                    {displayedUsers.map((like, index) => (
                        <span key={like.id}>
                            {index > 0 && ", "}
                            <span className="font-medium text-foreground">
                                {getUserDisplayName(like.user)}
                            </span>
                        </span>
                    ))}
                    {!showAll && remainingCount > 0 && (
                        <>
                            {" 和 "}
                            <button
                                onClick={() => setShowAll(true)}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                其他 {remainingCount} 人
                            </button>
                        </>
                    )}
                    {" 点赞了"}
                </span>
            </div>
        )
    }

    // 原来的布局：如果没有点赞用户或在列表页面，只显示基本的点赞按钮
    if (!showInline || likes.length === 0) {
        return (
            <Button
                variant={variant}
                size={size}
                className={buttonClassName}
                onClick={onLike}
                disabled={disabled}
            >
                <Heart className={heartClassName} />
                {likeCount}
            </Button>
        )
    }

    // 原来的内联布局
    const maxInlineDisplay = 3
    const displayedUsers = showAll ? likes : likes.slice(0, maxInlineDisplay)
    const remainingCount = likes.length - maxInlineDisplay

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
                <Button
                    variant={variant}
                    size={size}
                    className={buttonClassName}
                    onClick={onLike}
                    disabled={disabled}
                >
                    <Heart className={heartClassName} />
                    {likeCount}
                </Button>
            </div>
            {likes.length > 0 && (
                <div className={`text-xs text-muted-foreground ${className}`}>
                    <span>
                        {displayedUsers.map((like, index) => (
                            <span key={like.id}>
                                {index > 0 && ", "}
                                <span className="font-medium text-foreground">
                                    {getUserDisplayName(like.user)}
                                </span>
                            </span>
                        ))}
                        {!showAll && remainingCount > 0 && (
                            <>
                                {" 和 "}
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    其他 {remainingCount} 人
                                </button>
                            </>
                        )}
                        {" 点赞了"}
                    </span>
                </div>
            )}
        </div>
    )
} 