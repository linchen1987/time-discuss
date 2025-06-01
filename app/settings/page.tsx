"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Layout } from "@/components/Layout"
import { User, Palette, LogOut, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
    const { data: session } = useSession()

    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" })
    }

    // 空的右侧边栏内容，用于保持与首页一致的主内容宽度
    const rightSidebarContent = (
        <div className="p-4">
            {/* 空的占位符，保持布局一致性 */}
        </div>
    )

    return (
        <Layout
            title="设置"
            showRightSidebar={true}
            rightSidebarContent={rightSidebarContent}
        >
            <div className="p-4">
                <div className="space-y-1">
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
        </Layout>
    )
} 