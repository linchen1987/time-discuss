"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
    const pathname = usePathname()

    const navItems = [
        {
            href: "/",
            icon: Home,
            label: "首页",
        },
        {
            href: "/settings",
            icon: Settings,
            label: "设置",
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 md:hidden">
            <nav className="flex justify-center">
                <div className="flex items-center justify-around w-full max-w-md py-0">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 mb-0.5" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
} 