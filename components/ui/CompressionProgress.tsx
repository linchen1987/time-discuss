import React from 'react'
import { formatFileSize } from '@/lib/utils/imageCompression'
import { Loader2, TrendingDown, FileImage } from 'lucide-react'

// 简单的进度条组件
function SimpleProgress({ value, className = "" }: { value: number; className?: string }) {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    )
}

interface CompressionProgressProps {
    isCompressing: boolean
    progress: number
    stats: {
        totalOriginalSize: number
        totalCompressedSize: number
        totalSavings: number
        compressionRatio: number
    }
    className?: string
}

export function CompressionProgress({
    isCompressing,
    progress,
    stats,
    className = ""
}: CompressionProgressProps) {
    const { totalOriginalSize, totalCompressedSize, totalSavings, compressionRatio } = stats

    if (!isCompressing && totalOriginalSize === 0) {
        return null
    }

    return (
        <div className={`space-y-3 p-4 border rounded-lg bg-muted/50 ${className}`}>
            {/* 压缩进度 */}
            {isCompressing && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>正在压缩图片...</span>
                        <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <SimpleProgress value={progress} className="h-2" />
                </div>
            )}

            {/* 压缩统计 */}
            {totalOriginalSize > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {/* 原始大小 */}
                    <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-gray-500" />
                        <div>
                            <div className="text-muted-foreground">原始大小</div>
                            <div className="font-medium">{formatFileSize(totalOriginalSize)}</div>
                        </div>
                    </div>

                    {/* 压缩后大小 */}
                    <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-blue-500" />
                        <div>
                            <div className="text-muted-foreground">压缩后</div>
                            <div className="font-medium">{formatFileSize(totalCompressedSize)}</div>
                        </div>
                    </div>

                    {/* 节省空间 */}
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <div>
                            <div className="text-muted-foreground">节省空间</div>
                            <div className="font-medium text-green-600">
                                {formatFileSize(totalSavings)}
                            </div>
                        </div>
                    </div>

                    {/* 压缩比例 */}
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">%</span>
                        </div>
                        <div>
                            <div className="text-muted-foreground">压缩率</div>
                            <div className="font-medium text-green-600">
                                {compressionRatio}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 压缩完成提示 */}
            {!isCompressing && totalOriginalSize > 0 && compressionRatio > 0 && (
                <div className="text-sm text-green-600 font-medium">
                    ✅ 压缩完成！节省了 {compressionRatio}% 的空间
                </div>
            )}
        </div>
    )
} 