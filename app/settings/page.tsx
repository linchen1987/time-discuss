"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Sidebar } from "@/components/Sidebar"
import { User, Palette, LogOut, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
    const { data: session } = useSession()

    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" })
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 桌面端布局 - 三栏布局与首页保持一致 */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto flex">
                    {/* 左侧边栏 */}
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>

                    {/* 主内容区域 */}
                    <main className="flex-1 border-x border-border">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
                            <h1 className="text-xl font-bold">设置</h1>
                        </div>

                        <div className="p-4">
                            <div className="max-w-2xl space-y-1">
                                {/* 个人资料 */}
                                <Link href="/profile">
                                    <div className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                        <User className="mr-3 h-5 w-5 text-muted-foreground" />
                                        <p className="font-medium flex-1">个人资料</p>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Link>

                                {/* 主题模式 */}
                                <div className="flex items-center p-3 rounded-lg">
                                    <Palette className="mr-3 h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">主题模式</p>
                                    </div>
                                    <ThemeToggle className="-mr-3" />
                                </div>

                                {/* 退出登录 */}
                                {session && (
                                    <div
                                        className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer text-destructive"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-3 h-5 w-5" />
                                        <p className="font-medium">退出登录</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* 右侧占位区域 - 保持与首页布局一致 */}
                    <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                        {/* 空白区域，保持布局一致性 */}
                    </div>
                </div>
            </div>

            {/* 移动端布局 */}
            <div className="md:hidden">
                <main className="border-x border-border">
                    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
                        <h1 className="text-xl font-bold">设置</h1>
                    </div>

                    <div className="p-4">
                        <div className="max-w-2xl space-y-1">
                            {/* 个人资料 */}
                            <Link href="/profile">
                                <div className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                    <User className="mr-3 h-5 w-5 text-muted-foreground" />
                                    <p className="font-medium flex-1">个人资料</p>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </Link>

                            {/* 主题模式 */}
                            <div className="flex items-center p-3 rounded-lg">
                                <Palette className="mr-3 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-medium">主题模式</p>
                                </div>
                                <ThemeToggle />
                            </div>

                            {/* 退出登录 */}
                            {session && (
                                <div
                                    className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer text-destructive"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    <p className="font-medium">退出登录</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
} 