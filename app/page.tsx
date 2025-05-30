import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/Sidebar"
import { PostForm } from "@/components/PostForm"
import { PostList } from "@/components/PostList"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // 获取用户详细信息
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          likes: true,
        },
      },
    },
  })

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
            <PostForm />

            {/* 帖子列表 */}
            <PostList />
          </main>

          {/* 右侧边栏 */}
          <div className="w-80 sticky top-0 h-screen overflow-y-auto hidden lg:block">
            <div className="p-4 space-y-4">
              {/* 用户信息卡片 */}
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "用户头像"} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {user?.name || user?.username || "用户"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      @{user?.username || "user"}
                    </p>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{user?._count.posts || 0}</div>
                    <div className="text-xs text-muted-foreground">帖子</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{user?._count.comments || 0}</div>
                    <div className="text-xs text-muted-foreground">评论</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{user?._count.likes || 0}</div>
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
          <PostForm />

          {/* 帖子列表 */}
          <PostList />
        </main>
      </div>
    </div>
  )
}
