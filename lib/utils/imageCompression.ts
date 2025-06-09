/**
 * 图片压缩工具类
 * 支持多种压缩策略和配置选项
 */

// 压缩配置接口
export interface CompressionConfig {
  // 最大文件大小 (MB)
  maxSizeMB?: number;
  // 最大宽度或高度 (px)
  maxWidthOrHeight?: number;
  // 压缩质量 (0-1)
  quality?: number;
  // 输出格式
  fileType?: string;
  // 是否使用多线程
  useWebWorker?: boolean;
  // 是否保持EXIF信息
  preserveExif?: boolean;
  // 初始质量（用于渐进压缩）
  initialQuality?: number;
}

// 压缩结果接口
export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  success: boolean;
  error?: string;
}

// 预设配置
export const COMPRESSION_PRESETS = {
  // 头像压缩 - 高质量小尺寸
  avatar: {
    maxSizeMB: 1,
    maxWidthOrHeight: 400,
    quality: 0.9,
    fileType: 'image/jpeg',
    useWebWorker: false,
    preserveExif: false,
  },
  // 帖子图片 - 平衡质量和大小
  post: {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    quality: 0.8,
    fileType: 'image/jpeg',
    useWebWorker: true,
    preserveExif: false,
  },
  // 缩略图 - 最小文件大小
  thumbnail: {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 300,
    quality: 0.7,
    fileType: 'image/jpeg',
    useWebWorker: false,
    preserveExif: false,
  },
  // 高质量 - 保持较好画质
  highQuality: {
    maxSizeMB: 5,
    maxWidthOrHeight: 2560,
    quality: 0.92,
    useWebWorker: true,
    preserveExif: true,
  },
} as const;

// 使用动态导入避免打包时的依赖问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let imageCompression: ((file: File, options: any) => Promise<File>) | null = null;

async function getImageCompressionLibrary() {
  if (!imageCompression) {
    try {
      // 动态导入，避免类型检查错误
      const compressionModule = await import('browser-image-compression');
      imageCompression = compressionModule.default || compressionModule;
    } catch (error) {
      console.warn('browser-image-compression 库加载失败，将使用 Canvas 备选方案:', error);
      return null;
    }
  }
  return imageCompression;
}

/**
 * 主压缩函数 - 使用 browser-image-compression
 */
export async function compressImage(file: File, config: CompressionConfig = {}): Promise<CompressionResult> {
  const originalSize = file.size;

  try {
    // 获取压缩库
    const compressionLib = await getImageCompressionLibrary();

    if (!compressionLib) {
      // 降级到 Canvas 方案
      return await compressImageWithCanvas(file, config);
    }

    // 默认配置
    const options = {
      maxSizeMB: config.maxSizeMB || 2,
      maxWidthOrHeight: config.maxWidthOrHeight || 1920,
      useWebWorker: config.useWebWorker !== false,
      preserveExif: config.preserveExif || false,
      initialQuality: config.quality || 0.8,
      fileType: config.fileType,
    };

    // 执行压缩
    const compressedFile = await compressionLib(file, options);

    const compressedSize = compressedFile.size;
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      success: true,
    };
  } catch (error) {
    console.error('图片压缩失败:', error);

    // 如果主压缩方案失败，尝试 Canvas 备选方案
    try {
      return await compressImageWithCanvas(file, config);
    } catch {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        success: false,
        error: error instanceof Error ? error.message : '压缩失败',
      };
    }
  }
}

/**
 * Canvas 备选压缩方案
 */
export async function compressImageWithCanvas(file: File, config: CompressionConfig = {}): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        success: false,
        error: 'Canvas 上下文创建失败',
      });
      return;
    }

    img.onload = () => {
      try {
        // 计算新尺寸
        const { width, height } = calculateDimensions(img.width, img.height, config.maxWidthOrHeight || 1920);

        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 0,
                success: false,
                error: 'Canvas 转换失败',
              });
              return;
            }

            // 创建新文件
            const compressedFile = new File([blob], file.name, {
              type: config.fileType || 'image/jpeg',
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio,
              success: true,
            });
          },
          config.fileType || 'image/jpeg',
          config.quality || 0.8
        );
      } catch (error) {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Canvas 处理失败',
        });
      }
    };

    img.onerror = () => {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        success: false,
        error: '图片加载失败',
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  files: File[],
  config: CompressionConfig = {},
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(Math.round((i / files.length) * 100), i, files.length);

    const result = await compressImage(file, config);
    results.push(result);
  }

  onProgress?.(100, files.length, files.length);
  return results;
}

/**
 * 智能压缩 - 根据文件大小自动选择压缩策略
 */
export async function smartCompress(file: File): Promise<CompressionResult> {
  const fileSizeMB = file.size / (1024 * 1024);

  let config: CompressionConfig;

  if (fileSizeMB <= 1) {
    // 小文件，轻度压缩
    config = { ...COMPRESSION_PRESETS.highQuality, maxSizeMB: 0.8 };
  } else if (fileSizeMB <= 5) {
    // 中等文件，标准压缩
    config = COMPRESSION_PRESETS.post;
  } else if (fileSizeMB <= 10) {
    // 大文件，较强压缩
    config = { ...COMPRESSION_PRESETS.post, quality: 0.7, maxSizeMB: 3 };
  } else {
    // 超大文件，强压缩
    config = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1280,
      quality: 0.6,
      useWebWorker: true,
      preserveExif: false,
    };
  }

  return compressImage(file, config);
}

/**
 * 检查是否需要压缩
 */
export function shouldCompress(file: File, maxSizeMB: number = 2): boolean {
  // 检查文件大小
  if (file.size > maxSizeMB * 1024 * 1024) {
    return true;
  }

  // 对于图片，我们无法直接获取尺寸，所以假设大文件需要压缩
  return false;
}

/**
 * 计算压缩后的尺寸
 */
function calculateDimensions(originalWidth: number, originalHeight: number, maxDimension: number): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    };
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取图片信息
 */
export function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  type: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        type: file.type,
        size: file.size,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('无法加载图片'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}
