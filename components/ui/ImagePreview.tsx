import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface ImagePreviewProps {
    images: string[]
    onRemove?: (index: number) => void
    className?: string
    imageClassName?: string
    showRemoveButton?: boolean
    onClick?: (url: string, index: number) => void
}

export function ImagePreview({
    images,
    onRemove,
    className = "",
    imageClassName = "",
    showRemoveButton = true,
    onClick
}: ImagePreviewProps) {
    if (images.length === 0) return null

    // 根据图片数量决定布局
    const getImageLayout = (imageCount: number) => {
        if (imageCount === 1) return "grid-cols-1"
        if (imageCount === 2) return "grid-cols-2"
        if (imageCount === 3) return "grid-cols-2"
        if (imageCount === 4) return "grid-cols-2"
        return "grid-cols-3"
    }

    const getImageHeight = (imageCount: number, index: number) => {
        if (imageCount === 1) return "h-64"
        if (imageCount === 3 && index === 0) return "h-64"
        return "h-32"
    }

    const getImageSpan = (imageCount: number, index: number) => {
        if (imageCount === 3 && index === 0) return "col-span-2"
        return ""
    }

    return (
        <div className={`grid gap-2 ${getImageLayout(images.length)} ${className}`}>
            {images.map((url, index) => (
                <div
                    key={index}
                    className={`relative group overflow-hidden rounded-lg ${getImageSpan(images.length, index)}`}
                >
                    <Image
                        src={url}
                        alt={`图片 ${index + 1}`}
                        width={400}
                        height={300}
                        className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${getImageHeight(images.length, index)} ${imageClassName}`}
                        onClick={() => onClick?.(url, index)}
                    />
                    {showRemoveButton && onRemove && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemove(index)
                            }}
                            className="absolute top-2 right-2 bg-gray-900 hover:bg-gray-900 text-white rounded-full p-1.5 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
} 