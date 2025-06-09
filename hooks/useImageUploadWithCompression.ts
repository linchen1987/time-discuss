import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { logError } from '@/lib/debug';
import {
  compressImage,
  smartCompress,
  COMPRESSION_PRESETS,
  type CompressionConfig,
  type CompressionResult,
  formatFileSize,
} from '@/lib/utils/imageCompression';

export interface UseImageUploadWithCompressionOptions {
  maxImages?: number;
  uploadEndpoint?: string;
  compressionMode?: 'smart' | 'preset' | 'custom';
  preset?: keyof typeof COMPRESSION_PRESETS;
  customConfig?: CompressionConfig;
  onCompressionComplete?: (results: CompressionResult[]) => void;
  enableCompression?: boolean;
  showCompressionProgress?: boolean;
}

interface UseImageUploadWithCompressionReturn {
  uploadedImages: string[];
  isUploading: boolean;
  isCompressing: boolean;
  compressionProgress: number;
  compressionStats: {
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
    compressionRatio: number;
  };
  handleImageUpload: (files: FileList) => Promise<void>;
  removeImage: (index: number) => void;
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  resetCompressionStats: () => void;
}

export function useImageUploadWithCompression(options: UseImageUploadWithCompressionOptions = {}): UseImageUploadWithCompressionReturn {
  const {
    maxImages = 9,
    uploadEndpoint = '/api/uploads/post-images',
    compressionMode = 'smart',
    preset = 'post',
    customConfig,
    onCompressionComplete,
    enableCompression = true,
    showCompressionProgress = true,
  } = options;

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState({
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    totalSavings: 0,
    compressionRatio: 0,
  });

  const resetCompressionStats = useCallback(() => {
    setCompressionStats({
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSavings: 0,
      compressionRatio: 0,
    });
    setCompressionProgress(0);
  }, []);

  const compressFiles = useCallback(
    async (files: File[]): Promise<File[]> => {
      if (!enableCompression) return files;

      setIsCompressing(true);
      setCompressionProgress(0);

      const results: CompressionResult[] = [];
      const compressedFiles: File[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (showCompressionProgress) {
            setCompressionProgress(Math.round((i / files.length) * 100));
          }

          let result: CompressionResult;

          // 选择压缩策略
          switch (compressionMode) {
            case 'smart':
              result = await smartCompress(file);
              break;
            case 'preset':
              result = await compressImage(file, COMPRESSION_PRESETS[preset]);
              break;
            case 'custom':
              result = await compressImage(file, customConfig || {});
              break;
            default:
              result = await smartCompress(file);
          }

          results.push(result);
          compressedFiles.push(result.file);
        }

        // 计算统计信息
        const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalSavings = totalOriginalSize - totalCompressedSize;
        const compressionRatio = totalOriginalSize > 0 ? Math.round((totalSavings / totalOriginalSize) * 100) : 0;

        setCompressionStats({
          totalOriginalSize,
          totalCompressedSize,
          totalSavings,
          compressionRatio,
        });

        // 显示压缩结果
        if (showCompressionProgress && results.some((r) => r.success)) {
          const successCount = results.filter((r) => r.success).length;
          const failCount = results.length - successCount;

          if (failCount === 0) {
            toast.success(`图片压缩完成！节省 ${formatFileSize(totalSavings)} (${compressionRatio}%)`);
          } else {
            toast.warning(`${successCount} 张图片压缩成功，${failCount} 张失败`);
          }
        }

        onCompressionComplete?.(results);
        setCompressionProgress(100);

        return compressedFiles;
      } catch (error) {
        logError('useImageUploadWithCompression', error, 'Compression failed');
        toast.error('图片压缩失败，将使用原图上传');
        return files;
      } finally {
        setIsCompressing(false);
      }
    },
    [enableCompression, compressionMode, preset, customConfig, onCompressionComplete, showCompressionProgress]
  );

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      const fileArray = Array.from(files);
      if (uploadedImages.length + fileArray.length > maxImages) {
        toast.error(`最多上传${maxImages}张图片`);
        return;
      }

      try {
        // 压缩图片
        const processedFiles = await compressFiles(fileArray);

        setIsUploading(true);

        // 创建 FormData
        const formData = new FormData();
        processedFiles.forEach((file) => {
          formData.append('files', file);
        });

        // 上传图片
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
        logError('useImageUploadWithCompression', error, 'Image upload failed');
        toast.error(error instanceof Error ? error.message : '图片上传失败');
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedImages.length, maxImages, compressFiles, uploadEndpoint]
  );

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploadedImages,
    isUploading,
    isCompressing,
    compressionProgress,
    compressionStats,
    handleImageUpload,
    removeImage,
    setUploadedImages,
    resetCompressionStats,
  };
}
