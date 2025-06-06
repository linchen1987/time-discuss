import { useState } from 'react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';

interface UseImageUploadOptions {
  maxImages?: number;
  uploadEndpoint?: string;
}

interface UseImageUploadReturn {
  uploadedImages: string[];
  isUploading: boolean;
  handleImageUpload: (files: FileList) => Promise<void>;
  removeImage: (index: number) => void;
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { maxImages = 9, uploadEndpoint = '/api/uploads/post-images' } = options;

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    const fileArray = Array.from(files);
    if (uploadedImages.length + fileArray.length > maxImages) {
      toast.error(`最多上传${maxImages}张图片`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = '上传失败';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 处理非JSON响应（如413 Request Entity Too Large）
          if (response.status === 413) {
            errorMessage = `图片文件过大: ${errorMessage}`;
          } else if (response.status >= 500) {
            errorMessage = `服务器错误: ${errorMessage}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUploadedImages((prev) => [...prev, ...data.urls]);
      toast.success('图片上传成功');
    } catch (error) {
      logError('useImageUpload', error, 'Image upload failed');
      toast.error(error instanceof Error ? error.message : '图片上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    uploadedImages,
    isUploading,
    handleImageUpload,
    removeImage,
    setUploadedImages,
  };
}
