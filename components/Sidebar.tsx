"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, User, Bell, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface ExtendedUser {
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    image?: string | null;
}

export function Sidebar() {
    const { data: session } = useSession()
    const user = session?.user as ExtendedUser | undefined;

    return (
        <div className="w-64 p-4 hidden md:block">
            <div className="space-y-4">
                {/* Logo */}
                <div className="px-3 py-2">
                    <h1 className="text-xl font-bold">朋友之家</h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start" size="lg">
                            <Home className="mr-3 h-5 w-5" />
                            首页
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Bell className="mr-3 h-5 w-5" />
                        通知
                    </Button>
                    <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start" size="lg">
                            <User className="mr-3 h-5 w-5" />
                            个人资料
                        </Button>
                    </Link>

                    {/* Theme Toggle */}
                    <ThemeToggle />
                </nav>

                {/* User Info */}
                {session && (
                    <div className="mt-auto pt-4 border-t border-border">
                        <Link href="/profile">
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <Avatar>
                                    <AvatarImage src={user?.avatarUrl || user?.image || ""} />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user?.name || "用户"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full justify-start mt-2"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            退出登录
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
} 