"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Settings } from "lucide-react"

export function Sidebar() {
    return (
        <div className="w-full p-4">
            <div className="space-y-4">
                {/* Logo */}
                <div className="px-3 py-2">
                    <h1 className="text-xl font-bold">朋友之家</h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-4">
                    <div>
                        <Link href="/">
                            <Button variant="ghost" className="w-full justify-start items-center text-md cursor-pointer" size="lg">
                                <Home className="mr-2 size-5" />
                                首页
                            </Button>
                        </Link>
                    </div>
                    {/* <Button variant="ghost" className="w-full justify-start" size="lg">
                        <Bell className="mr-3 h-5 w-5" />
                        通知
                    </Button> */}
                    <div>
                        <Link href="/settings">
                            <Button variant="ghost" className="w-full justify-start items-center text-md cursor-pointer" size="lg">
                                <Settings className="mr-2 size-5" />
                                设置
                            </Button>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    )
} 