"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileNavigation } from "@/components/MobileNavigation"

interface LayoutProps {
    children: ReactNode
    title?: string
    titleContent?: ReactNode
    showRightSidebar?: boolean
    rightSidebarContent?: ReactNode
}

export function Layout({
    children,
    title = "页面",
    titleContent,
    showRightSidebar = false,
    rightSidebarContent
}: LayoutProps) {
    const headerContent = titleContent || <h1 className="text-xl font-bold">{title}</h1>

    return (
        <div className="min-h-screen bg-background">
            {/* 桌面端布局 */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto flex">
                    {/* 左侧边栏 */}
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>

                    {/* 主内容区域 */}
                    <main className="flex-1 border-x border-border">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-40">
                            {headerContent}
                        </div>
                        {children}
                    </main>

                    {/* 右侧边栏 */}
                    {showRightSidebar && (
                        <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                            {rightSidebarContent}
                        </div>
                    )}
                </div>
            </div>

            {/* 移动端布局 */}
            <div className="md:hidden">
                <main className="pb-12"> {/* 底部留出导航栏空间 */}
                    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-40">
                        {headerContent}
                    </div>
                    {children}
                </main>

                {/* 移动端底部导航 */}
                <MobileNavigation />
            </div>
        </div>
    )
} 