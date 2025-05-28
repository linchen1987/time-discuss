import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { PostForm } from "@/components/PostForm"
import { PostList } from "@/components/PostList"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto flex">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 主内容区域 */}
        <main className="flex-1 border-x border-border">
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
            <h1 className="text-xl font-bold">首页</h1>
          </div>

          {/* 发布框 */}
          <PostForm />

          {/* 帖子列表 */}
          <PostList />
        </main>

        {/* 右侧边栏（暂时留空） */}
        <div className="w-80 p-4 hidden lg:block">
          <div className="bg-muted rounded-xl p-4">
            <h2 className="font-bold text-lg mb-2">朋友之家</h2>
            <p className="text-muted-foreground text-sm">
              与朋友分享生活的美好时光
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
