"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/Sidebar"
import { PostForm } from "@/components/PostForm"
import { PostCard } from "@/components/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import type { PostWithDetails } from "@/lib/types"
import { debugAPI, debugAuth, logError } from '@/lib/debug'

interface UserProfile {
  id: string
  username: string | null
  name: string | null
  email: string | null
  avatarUrl: string | null
  createdAt: string
  _count: {
    posts: number
    comments: number
    likes: number
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      redirect("/auth/login")
    }
  }, [session, status])

  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      if (!session) return

      debugAuth('开始获取用户信息...')

      try {
        const response = await fetch(`/api/users/profile`)
        debugAPI('用户信息 API 响应状态: %d', response.status)

        if (response.ok) {
          const userData = await response.json()
          debugAuth('获取到的用户数据: %O', userData)
          setUser(userData)
        } else {
          // 改进错误处理
          const responseText = await response.text()

          try {
            const errorData = JSON.parse(responseText)
            logError('HomePage', errorData, `API error (${response.status})`)
          } catch {
            logError('HomePage', responseText, `API error (${response.status})`)
          }
        }
      } catch (error) {
        logError('HomePage', error, 'Failed to fetch user data')
      }
    }

    if (session) {
      fetchUser()
    }
  }, [session])

  // 获取帖子列表
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        logError('HomePage', error, 'Failed to fetch posts')
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 处理新帖子创建
  const handlePostCreated = (newPost: PostWithDetails) => {
    setPosts(prev => [newPost, ...prev])
  }

  // 处理帖子删除
  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  // 处理帖子更新
  const handlePostUpdated = (updatedPost: PostWithDetails) => {
    setPosts(prev => prev.map(post =>
      post.id === updatedPost.id ? updatedPost : post
    ))
  }

  // 如果会话正在加载，显示最小化的加载状态
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto flex">
          <div className="w-64 sticky top-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>
          <main className="flex-1 border-x border-border">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
              <h1 className="text-xl font-bold">首页</h1>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <p>正在验证登录状态...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 桌面端布局 - 三栏紧挨着 */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto flex">
          {/* 左侧边栏 */}
          <div className="w-64 sticky top-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>

          {/* 主内容区域 */}
          <main className="flex-1 border-x border-border">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
              <h1 className="text-xl font-bold">首页</h1>
            </div>

            {/* 发布框 */}
            <PostForm onPostCreated={handlePostCreated} />

            {/* 帖子列表 */}
            <div>
              {postsLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>加载中...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>还没有任何帖子</p>
                  <p className="text-sm mt-1">成为第一个分享的人吧！</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
                ))
              )}
            </div>
          </main>

          {/* 右侧边栏 */}
          <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
            <div className="p-4 space-y-4">
              {/* 用户信息卡片 */}
              <div className="bg-muted rounded-xl p-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.name || "用户头像"} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {user.name || user.username || "用户"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          @{user.username || "user"}
                        </p>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{user._count.posts || 0}</div>
                        <div className="text-xs text-muted-foreground">帖子</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{user._count.comments || 0}</div>
                        <div className="text-xs text-muted-foreground">评论</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{user._count.likes || 0}</div>
                        <div className="text-xs text-muted-foreground">点赞</div>
                      </div>
                    </div>

                    {/* 个人资料按钮 */}
                    <Link href="/profile">
                      <Button variant="outline" className="w-full" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        查看个人资料
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="h-4 bg-muted-foreground/20 rounded animate-pulse mb-1"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-20"></div>
                      </div>
                    </div>

                    {/* 统计信息骨架屏 */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <div className="h-6 bg-muted-foreground/20 rounded animate-pulse mb-1"></div>
                        <div className="text-xs text-muted-foreground">帖子</div>
                      </div>
                      <div>
                        <div className="h-6 bg-muted-foreground/20 rounded animate-pulse mb-1"></div>
                        <div className="text-xs text-muted-foreground">评论</div>
                      </div>
                      <div>
                        <div className="h-6 bg-muted-foreground/20 rounded animate-pulse mb-1"></div>
                        <div className="text-xs text-muted-foreground">点赞</div>
                      </div>
                    </div>

                    {/* 个人资料按钮 */}
                    <Button variant="outline" className="w-full" size="sm" disabled>
                      <User className="w-4 h-4 mr-2" />
                      查看个人资料
                    </Button>
                  </>
                )}
              </div>

              {/* 朋友之家介绍 */}
              <div className="bg-muted rounded-xl p-4">
                <h2 className="font-bold text-lg mb-2">朋友之家</h2>
                <p className="text-muted-foreground text-sm">
                  与朋友分享生活的美好时光
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端布局 */}
      <div className="md:hidden">
        <main className="border-x border-border">
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
            <h1 className="text-xl font-bold">首页</h1>
          </div>

          {/* 发布框 */}
          <PostForm onPostCreated={handlePostCreated} />

          {/* 帖子列表 */}
          <div>
            {postsLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>加载中...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>还没有任何帖子</p>
                <p className="text-sm mt-1">成为第一个分享的人吧！</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
