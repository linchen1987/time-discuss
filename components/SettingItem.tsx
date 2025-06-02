import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingItemProps {
    icon: React.ReactNode
    title: string
    description?: string
    href?: string
    onClick?: () => void
    rightContent?: React.ReactNode
    showChevron?: boolean
    variant?: "default" | "destructive"
    className?: string
}

export function SettingItem({
    icon,
    title,
    description,
    href,
    onClick,
    rightContent,
    showChevron = false,
    variant = "default",
    className,
}: SettingItemProps) {
    const baseClassName = cn(
        "flex items-center px-3 py-2 rounded-lg transition-colors",
        variant === "default"
            ? "hover:bg-muted cursor-pointer"
            : "hover:bg-muted cursor-pointer text-destructive",
        className
    )

    const content = (
        <>
            <div className="mr-3 h-5 w-5 text-muted-foreground">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-medium">{title}</p>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {rightContent && rightContent}
            {showChevron && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
        </>
    )

    if (href) {
        return (
            <Link href={href} className="block">
                <div className={baseClassName}>
                    {content}
                </div>
            </Link>
        )
    }

    if (onClick) {
        return (
            <div className={baseClassName} onClick={onClick}>
                {content}
            </div>
        )
    }

    return (
        <div className={baseClassName}>
            {content}
        </div>
    )
} 