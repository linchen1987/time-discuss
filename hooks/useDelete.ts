import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

interface UseDeleteProps {
  entityId: string;
  entityType: 'post' | 'comment';
  onDeleted?: (entityId: string) => void;
}

export function useDelete({ entityId, entityType, onDeleted }: UseDeleteProps) {
  const { data: session } = useSession();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!session || isDeleting) return;

    setIsDeleting(true);
    try {
      const apiUrl = entityType === 'post' ? `/api/posts/${entityId}` : `/api/comments/${entityId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // 尝试解析错误响应
        let errorMessage = '删除失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果不是JSON响应，使用状态码提示
          if (response.status === 404) {
            errorMessage = `${entityType === 'post' ? '帖子' : '评论'}API接口不存在，请联系管理员`;
          } else if (response.status === 403) {
            errorMessage = `没有权限删除此${entityType === 'post' ? '帖子' : '评论'}`;
          } else {
            errorMessage = `请求失败 (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      toast.success(`${entityType === 'post' ? '帖子' : '评论'}已删除`);

      // 通知父组件更新列表
      if (onDeleted) {
        onDeleted(entityId);
      }
    } catch (error) {
      logError(`useDelete-${entityType}`, error, 'Delete operation failed');
      toast.error(error instanceof Error ? error.message : '删除失败，请重试');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const canDelete = !!session;

  return {
    isDeleting,
    showDeleteDialog,
    setShowDeleteDialog,
    handleDeleteClick,
    handleDelete,
    canDelete,
  };
}
