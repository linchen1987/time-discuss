"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, User, Bell, LogOut } from "lucide-react"

export function Sidebar() {
    const { data: session } = useSession()

    return (
        <div className="w-64 p-4 hidden md:block">
            <div className="space-y-4">
                {/* Logo */}
                <div className="px-3 py-2">
                    <h1 className="text-xl font-bold">朋友之家</h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Home className="mr-3 h-5 w-5" />
                        首页
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Bell className="mr-3 h-5 w-5" />
                        通知
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="lg">
                        <User className="mr-3 h-5 w-5" />
                        个人资料
                    </Button>
                </nav>

                {/* User Info */}
                {session && (
                    <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                            <Avatar>
                                <AvatarImage src={session.user?.image || ""} />
                                <AvatarFallback>
                                    {session.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {session.user?.name || "用户"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    @{session.user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                                </p>
                            </div>
                        </div>
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