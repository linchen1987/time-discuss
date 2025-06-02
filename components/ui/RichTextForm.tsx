"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextEditor } from "../editor/RichTextEditor"
import { useRichTextForm } from "@/hooks/useRichTextForm"

interface RichTextFormProps<T> {
    onSubmit: (
        editorState: Record<string, unknown> | null,
        contentHtml: string,
        uploadedImages: string[]
    ) => Promise<T>
    onSuccess?: (result: T) => void
    onCancel?: () => void
    placeholder?: string
    submitText?: string
    successMessage?: string
    errorMessage?: string
    className?: string
    compact?: boolean
    mode?: "post" | "comment" | "reply"
    maxHeight?: string
    showCancel?: boolean
    cancelText?: string
    validateContent?: boolean
    componentName?: string
}

export function RichTextForm<T = unknown>({
    onSubmit,
    onSuccess,
    onCancel,
    placeholder = "有什么新鲜事？",
    submitText = "发布",
    successMessage = "提交成功！",
    errorMessage = "提交失败，请重试",
    className = "",
    compact = false,
    mode,
    maxHeight,
    showCancel = false,
    cancelText = "取消",
    validateContent = true,
    componentName = "RichTextForm"
}: RichTextFormProps<T>) {
    const { data: session } = useSession()
    type UserWithAvatar = { avatarUrl?: string | null; name?: string | null }
    const user = session?.user as UserWithAvatar | undefined

    const {
        isSubmitting,
        editorKey,
        handleEditorChange,
        handleImagesChange,
        handleSubmit,
        canSubmit
    } = useRichTextForm({
        onSubmit,
        onSuccess,
        onCancel,
        successMessage,
        errorMessage,
        validateContent,
        componentName
    })

    if (!session) return null

    return (
        <div className={`flex space-x-3 ${className}`}>
            <Avatar className={compact ? 'h-10 w-10' : 'h-10 w-10'}>
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                <RichTextEditor
                    key={editorKey}
                    placeholder={placeholder}
                    onChange={handleEditorChange}
                    onImagesChange={handleImagesChange}
                    onSubmit={handleSubmit}
                    submitText={submitText}
                    isSubmitting={isSubmitting}
                    mode={mode}
                    maxHeight={maxHeight}
                    className="border-none shadow-none"
                    showCancel={showCancel}
                    onCancel={onCancel}
                    cancelText={cancelText}
                    canSubmit={canSubmit}
                />
            </div>
        </div>
    )
} 