import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">个人资料</h1>

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
    );
} 