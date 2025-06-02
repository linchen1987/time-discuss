"use client"

import { useSession, signOut } from "next-auth/react"
import { Layout } from "@/components/Layout"
import { User, Palette, LogOut, Smartphone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PWAInstallButton } from "@/components/pwa-install-button"
import { SettingItem } from "@/components/SettingItem"

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
                <div className="space-y-0">
                    {/* 个人资料 */}
                    <SettingItem
                        icon={<User />}
                        title="个人资料"
                        href="/profile"
                        showChevron={true}
                    />

                    {/* 主题模式 */}
                    <SettingItem
                        icon={<Palette />}
                        title="主题模式"
                        rightContent={<ThemeToggle className="-mr-3" />}
                    />

                    {/* PWA 安装 */}
                    <SettingItem
                        icon={<Smartphone />}
                        title="安装应用"
                        rightContent={<PWAInstallButton />}
                    />

                    {/* 退出登录 */}
                    {session && (
                        <SettingItem
                            icon={<LogOut />}
                            title="退出登录"
                            onClick={handleSignOut}
                            variant="destructive"
                            className="mt-3"
                        />
                    )}
                </div>
            </div>
        </Layout>
    )
} 