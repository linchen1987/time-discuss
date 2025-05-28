'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navigation() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                朋友之家
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            朋友之家
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                <span className="text-gray-700">
                                    欢迎，{session.user?.name || (session.user as any)?.username || '用户'}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    退出登录
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    登录
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    注册
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
} 