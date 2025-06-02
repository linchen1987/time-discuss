import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface User {
    id: string
    name: string | null
    username: string | null
    avatarUrl?: string | null
}

interface UserInfoProps {
    user: User
    createdAt: string | Date
    replyToUser?: {
        id: string
        name: string | null
        username?: string | null
    } | null
    size?: 'sm' | 'md' | 'lg'
    showAvatar?: boolean
}

export function UserInfo({
    user,
    createdAt,
    replyToUser,
    size = 'md',
    showAvatar = true
}: UserInfoProps) {
    const avatarSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
    const nameSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
    const metaSize = size === 'sm' ? 'text-xs' : 'text-sm'

    return (
        <div className="flex items-center space-x-2">
            {showAvatar && (
                <Avatar className={avatarSize}>
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className="flex items-center space-x-2 flex-wrap">
                <h3 className={`font-semibold ${nameSize}`}>
                    {user.name || "匿名用户"}
                </h3>
                <span className={`text-muted-foreground ${metaSize}`}>
                    @{user.username || user.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                </span>
                <span className={`text-muted-foreground ${metaSize}`}>·</span>
                <span className={`text-muted-foreground ${metaSize}`}>
                    {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                        locale: zhCN
                    })}
                </span>

                {/* 如果是回复，显示回复对象 */}
                {replyToUser && (
                    <>
                        <span className={`text-muted-foreground ${metaSize}`}>回复</span>
                        <span className={`text-blue-600 dark:text-blue-400 ${metaSize}`}>
                            @{replyToUser.name || "匿名用户"}
                        </span>
                    </>
                )}
            </div>
        </div>
    )
} 