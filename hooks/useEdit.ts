import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

// 创建一个空的 lexical state
function createEmptyLexicalState(): Record<string, unknown> {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

interface UseEditProps<T = Record<string, unknown>> {
  entityId: string;
  entityType: 'post' | 'comment';
  initialLexicalState: Record<string, unknown> | null;
  initialContentHtml: string;
  initialImages: string[];
  onUpdated?: (updatedEntity: T) => void;
}

export function useEdit<T = Record<string, unknown>>({
  entityId,
  entityType,
  initialLexicalState,
  initialContentHtml,
  initialImages,
  onUpdated,
}: UseEditProps<T>) {
  const { data: session } = useSession();

  // 确保总有一个有效的 lexical state，如果原始为 null 且有 HTML 内容，则创建一个空状态
  const validInitialLexicalState = initialLexicalState || (initialContentHtml.trim() ? createEmptyLexicalState() : null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedLexicalState, setEditedLexicalState] = useState<Record<string, unknown> | null>(validInitialLexicalState);
  const [editedContentHtml, setEditedContentHtml] = useState(initialContentHtml);
  const [editedImages, setEditedImages] = useState<string[]>(initialImages);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLexicalState(validInitialLexicalState);
    setEditedContentHtml(initialContentHtml);
    setEditedImages(initialImages);
  };

  const handleSaveEdit = async () => {
    if (!session || isUpdating) return;
    if (!hasActualContent) return;

    setIsUpdating(true);
    try {
      const apiUrl = entityType === 'post' ? `/api/posts/${entityId}` : `/api/comments/${entityId}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lexicalState: editedLexicalState,
          contentHtml: editedContentHtml,
          imageUrls: editedImages,
        }),
      });

      if (!response.ok) {
        // 尝试解析错误响应
        let errorMessage = '更新失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 如果不是JSON响应，使用状态码提示
          if (response.status === 404) {
            errorMessage = `${entityType === 'post' ? '帖子' : '评论'}API接口不存在，请联系管理员`;
          } else if (response.status === 403) {
            errorMessage = `没有权限编辑此${entityType === 'post' ? '帖子' : '评论'}`;
          } else {
            errorMessage = `请求失败 (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      toast.success(`${entityType === 'post' ? '帖子' : '评论'}已更新`);
      setIsEditing(false);

      // 通知父组件更新数据
      if (onUpdated && (result.post || result.comment)) {
        onUpdated(result.post || result.comment);
      }
    } catch (error) {
      logError(`useEdit-${entityType}`, error, 'Update operation failed');
      toast.error(error instanceof Error ? error.message : '更新失败，请重试');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
    setEditedLexicalState(editorState);
    setEditedContentHtml(html);
  };

  const canEdit = !!session;

  // 检查是否有实际内容
  const hasActualContent = Boolean(editedContentHtml.trim().length > 0 || editedImages.length > 0);

  // 检查是否有变化（相对于初始值）
  const hasContentChanges = editedContentHtml.trim() !== initialContentHtml.trim();
  const hasImageChanges = JSON.stringify(editedImages.sort()) !== JSON.stringify(initialImages.sort());

  // 最终的hasChanges：有实际内容且相对于初始值有变化
  const hasChanges = hasActualContent && (hasContentChanges || hasImageChanges);

  return {
    isEditing,
    isUpdating,
    editedLexicalState,
    editedContentHtml,
    editedImages,
    setEditedImages,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    handleEditorChange,
    canEdit,
    hasChanges,
  };
}
