import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/Sidebar';
import ProfileForm from '../../components/ProfileForm';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/login');
    }

    // 获取用户完整信息
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    likes: true,
                },
            },
        },
    });

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 桌面端布局 - 左侧边栏 + 主内容 */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto flex">
                    {/* 左侧边栏 */}
                    <div className="w-64 sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>

                    {/* 主内容区域 */}
                    <main className="flex-1 border-x border-border">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
                            <h1 className="text-xl font-bold">个人资料</h1>
                        </div>

                        <div className="container mx-auto px-4 py-8 max-w-2xl">
                            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
                                {/* 用户统计信息 */}
                                <div className="mb-8 p-4 bg-muted rounded-lg">
                                    <h2 className="text-lg font-semibold mb-3">账户统计</h2>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user._count.posts}</div>
                                            <div className="text-sm text-muted-foreground">帖子</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user._count.comments}</div>
                                            <div className="text-sm text-muted-foreground">评论</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{user._count.likes}</div>
                                            <div className="text-sm text-muted-foreground">点赞</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 个人资料编辑表单 */}
                                <ProfileForm user={user} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* 移动端布局 */}
            <div className="md:hidden">
                <main className="border-x border-border">
                    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-50">
                        <h1 className="text-xl font-bold">个人资料</h1>
                    </div>

                    <div className="container mx-auto px-4 py-8 max-w-2xl">
                        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
                            {/* 用户统计信息 */}
                            <div className="mb-8 p-4 bg-muted rounded-lg">
                                <h2 className="text-lg font-semibold mb-3">账户统计</h2>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user._count.posts}</div>
                                        <div className="text-sm text-muted-foreground">帖子</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user._count.comments}</div>
                                        <div className="text-sm text-muted-foreground">评论</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{user._count.likes}</div>
                                        <div className="text-sm text-muted-foreground">点赞</div>
                                    </div>
                                </div>
                            </div>

                            {/* 个人资料编辑表单 */}
                            <ProfileForm user={user} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 