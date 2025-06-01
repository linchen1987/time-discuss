"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 主题配置
const THEME_CONFIG = [
    {
        value: "light" as const,
        label: "浅色",
        icon: Sun,
    },
    {
        value: "dark" as const,
        label: "深色",
        icon: Moon,
    },
    {
        value: "system" as const,
        label: "自动",
        icon: Monitor,
    },
] as const

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // 确保组件在客户端完全挂载后才渲染动态内容
    React.useEffect(() => {
        setMounted(true)
    }, [])

    const getCurrentLabel = () => {
        if (!mounted) {
            return "主题设置"
        }

        const currentTheme = THEME_CONFIG.find(config => config.value === theme)
        return currentTheme?.label || "自动"
    }

    // 使用 useMemo 缓存主题按钮，只在相关依赖项变化时重新计算
    const themeButtons = React.useMemo(() => (
        <div className="flex items-center space-x-1">
            {THEME_CONFIG.map((config) => {
                const Icon = config.icon
                const isActive = mounted && theme === config.value

                return (
                    <Button
                        key={config.value}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-1.5 hover:bg-muted/80 transition-colors duration-200"
                        onClick={() => setTheme(config.value)}
                        title={config.label}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                )
            })}
        </div>
    ), [mounted, theme, setTheme])

    return (
        <div className={cn("flex items-center justify-between p-3 rounded-lg transition-colors", className)}>
            {/* 左边：当前主题状态 */}
            <div className="flex items-center space-x-3 pl-1">
                <span className="mr-2 text-md font-medium">{getCurrentLabel()}</span>
            </div>

            {/* 右边：三个主题选择按钮 */}
            {themeButtons}
        </div>
    )
} 