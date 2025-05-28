import { getPosts } from "@/lib/db-utils"
import { PostCard } from "@/components/PostCard"

export async function PostList() {
    const posts = await getPosts()

    return (
        <div>
            {posts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <p>还没有任何帖子</p>
                    <p className="text-sm mt-1">成为第一个分享的人吧！</p>
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
        </div>
    )
} 