"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // 确保组件在客户端完全挂载后才渲染动态内容
    React.useEffect(() => {
        setMounted(true)
    }, [])

    const getCurrentIcon = () => {
        if (!mounted) {
            return <Monitor className="h-4 w-4" />
        }

        switch (theme) {
            case "light":
                return <Sun className="h-4 w-4" />
            case "dark":
                return <Moon className="h-4 w-4" />
            case "system":
                return <Monitor className="h-4 w-4" />
            default:
                return <Monitor className="h-4 w-4" />
        }
    }

    const getCurrentLabel = () => {
        if (!mounted) {
            return "主题设置"
        }

        switch (theme) {
            case "light":
                return "浅色模式"
            case "dark":
                return "深色模式"
            case "system":
                return "跟随系统"
            default:
                return "跟随系统"
        }
    }

    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {/* 左边：当前主题状态 */}
            <div className="flex items-center space-x-3 pl-1">
                {getCurrentIcon()}
                <span className="ml-2 text-sm font-medium">{getCurrentLabel()}</span>
            </div>

            {/* 右边：三个主题选择按钮 */}
            <div className="flex items-center space-x-0.5">
                <Button
                    variant={theme === "light" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setTheme("light")}
                    title="浅色模式"
                >
                    <Sun className="h-3 w-3" />
                </Button>

                <Button
                    variant={theme === "dark" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setTheme("dark")}
                    title="深色模式"
                >
                    <Moon className="h-3 w-3" />
                </Button>

                <Button
                    variant={theme === "system" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setTheme("system")}
                    title="跟随系统"
                >
                    <Monitor className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
} 