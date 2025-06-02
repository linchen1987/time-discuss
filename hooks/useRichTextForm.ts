import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

interface UseRichTextFormProps<T> {
  onSubmit: (editorState: Record<string, unknown> | null, contentHtml: string, uploadedImages: string[]) => Promise<T>;
  onSuccess?: (result: T) => void;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validateContent?: boolean;
  componentName?: string;
}

interface UseRichTextFormReturn {
  // 状态
  editorState: Record<string, unknown> | null;
  contentHtml: string;
  isSubmitting: boolean;
  uploadedImages: string[];
  editorKey: number;

  // 处理函数
  handleEditorChange: (editorState: Record<string, unknown>, html: string) => void;
  handleImagesChange: (images: string[]) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;

  // 工具函数
  canSubmit: boolean;
  hasContent: boolean;
}

export function useRichTextForm<T = unknown>({
  onSubmit,
  onSuccess,
  onCancel,
  successMessage = '提交成功！',
  errorMessage = '提交失败，请重试',
  validateContent = true,
  componentName = 'RichTextForm',
}: UseRichTextFormProps<T>): UseRichTextFormReturn {
  const { data: session } = useSession();

  const [editorState, setEditorState] = useState<Record<string, unknown> | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editorKey, setEditorKey] = useState(0);

  const hasContent = Boolean(contentHtml.trim().length > 0 || uploadedImages.length > 0);
  const canSubmit = Boolean(!isSubmitting && (!validateContent || hasContent));

  const handleEditorChange = (editorState: Record<string, unknown>, html: string) => {
    setEditorState(editorState);
    setContentHtml(html);
  };

  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images);
  };

  const resetForm = () => {
    setEditorState(null);
    setContentHtml('');
    setUploadedImages([]);
    setEditorKey((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!session) {
      toast.error('请先登录');
      return;
    }

    if (validateContent && !hasContent) {
      toast.error('请输入内容');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(editorState, contentHtml, uploadedImages);

      resetForm();
      toast.success(successMessage);

      if (onSuccess) {
        onSuccess(result);
      }

      // 如果有取消回调（用于回复模式），自动取消
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      logError(componentName, err, 'Submit operation failed');
      toast.error(err instanceof Error ? err.message : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // 状态
    editorState,
    contentHtml,
    isSubmitting,
    uploadedImages,
    editorKey,

    // 处理函数
    handleEditorChange,
    handleImagesChange,
    handleSubmit,
    resetForm,

    // 工具函数
    canSubmit,
    hasContent,
  };
}
