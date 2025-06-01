import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

interface LikeUser {
  id: string;
  name: string | null;
  username: string | null;
}

interface LikeData {
  id: string;
  userId: string;
  user: LikeUser;
}

interface UseLikeProps {
  initialLikes: LikeData[];
  initialCount: number;
  entityId: string;
  entityType: 'post' | 'comment';
}

export function useLike({ initialLikes, initialCount, entityId, entityType }: UseLikeProps) {
  const { data: session } = useSession();
  const userId = session?.user ? (session.user as { id: string }).id : undefined;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);
  const [likes, setLikes] = useState<LikeData[]>(initialLikes);

  // 初始化点赞状态
  useEffect(() => {
    if (userId && initialLikes) {
      const userLike = initialLikes.find((like) => like.userId === userId);
      setIsLiked(!!userLike);
    }
  }, [userId, initialLikes]);

  const handleLike = async () => {
    if (!session || isLiking) return;

    setIsLiking(true);
    try {
      const apiUrl = entityType === 'post' ? `/api/posts/${entityId}/like` : `/api/comments/${entityId}/like`;

      const response = await fetch(apiUrl, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '操作失败');
      }

      const result = await response.json();

      // 更新UI状态
      setIsLiked(result.liked);

      // 根据实体类型更新点赞数
      if (entityType === 'comment') {
        setLikeCount(result.likeCount);
      } else {
        setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
      }

      // 如果点赞，添加当前用户到点赞列表；如果取消点赞，从列表中移除
      if (result.liked && session.user) {
        const user = session.user as { id: string; name?: string | null; username?: string | null };
        const newLike = {
          id: Date.now().toString(), // 临时ID
          userId: user.id,
          user: {
            id: user.id,
            name: user.name || null,
            username: user.username || null,
          },
        };
        setLikes((prev) => [...prev, newLike]);
      } else {
        const user = session.user as { id: string };
        setLikes((prev) => prev.filter((like) => like.userId !== user.id));
      }
    } catch (error) {
      logError(`useLike-${entityType}`, error, 'Like operation failed');
      toast.error(error instanceof Error ? error.message : '点赞失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLiking,
    likes,
    handleLike,
    canLike: !!session,
  };
}
