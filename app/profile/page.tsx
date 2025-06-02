"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Layout } from '@/components/Layout'
import ProfileForm from '@/components/ProfileForm'

interface ApiUser {
    id: string
    username: string | null
    email: string | null
    name: string | null
    avatarUrl: string | null
    createdAt: string
    _count: {
        posts: number
        comments: number
        likes: number
    }
}

interface User {
    id: string
    username: string | null
    email: string | null
    name: string | null
    avatarUrl: string | null
    createdAt: Date
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [userStats, setUserStats] = useState<{ posts: number, comments: number, likes: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "loading") return
        if (!session) {
            redirect('/auth/login')
            return
        }

        const fetchUser = async () => {
            try {
                const response = await fetch('/api/users/profile')
                if (response.ok) {
                    const userData: ApiUser = await response.json()
                    // 转换 createdAt 为 Date 对象以匹配 ProfileForm 期望的类型
                    const userForForm: User = {
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        name: userData.name,
                        avatarUrl: userData.avatarUrl,
                        createdAt: new Date(userData.createdAt)
                    }
                    setUser(userForForm)
                    setUserStats(userData._count)
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [session, status])

    if (status === "loading" || loading) {
        return (
            <Layout title="个人资料">
                <div className="p-8 text-center text-muted-foreground">
                    <p>加载中...</p>
                </div>
            </Layout>
        )
    }

    if (!session || !user || !userStats) {
        return null
    }

    // 空的右侧边栏内容，用于保持与首页一致的主内容宽度
    const rightSidebarContent = (
        <div className="p-4">
            {/* 空的占位符，保持布局一致性 */}
        </div>
    )

    return (
        <Layout
            title="个人资料"
            showRightSidebar={true}
            rightSidebarContent={rightSidebarContent}
        >
            <div className="p-4">
                <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
                    {/* 用户统计信息 */}
                    <div className="mb-8 p-4 bg-muted rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">账户统计</h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.posts}</div>
                                <div className="text-sm text-muted-foreground">帖子</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.comments}</div>
                                <div className="text-sm text-muted-foreground">评论</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.likes}</div>
                                <div className="text-sm text-muted-foreground">点赞</div>
                            </div>
                        </div>
                    </div>

                    {/* 个人资料编辑表单 */}
                    <ProfileForm user={user} />
                </div>
            </div>
        </Layout>
    )
} 