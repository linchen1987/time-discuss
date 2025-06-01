"use client"

import { Separator } from "@/components/ui/separator"
import { createPost } from "@/app/actions/posts"
import { RichTextForm } from "@/components/ui/RichTextForm"
import type { PostWithDetails } from "@/lib/types"

interface PostFormProps {
    onPostCreated?: (newPost: PostWithDetails) => void
}

export function PostForm({ onPostCreated }: PostFormProps) {
    const handleSubmit = async (
        editorState: Record<string, unknown> | null,
        contentHtml: string,
        uploadedImages: string[]
    ) => {
        return await createPost(editorState, contentHtml, uploadedImages)
    }

    const handleSuccess = (newPost: unknown) => {
        if (onPostCreated && newPost) {
            onPostCreated(newPost as PostWithDetails)
        }
    }

    return (
        <div className="">
            <div className="p-4 pb-0">
                <RichTextForm
                    onSubmit={handleSubmit}
                    onSuccess={handleSuccess}
                    placeholder="有什么新鲜事？"
                    submitText="发布"
                    successMessage="发布成功！"
                    errorMessage="发布失败，请重试"
                    componentName="PostForm"
                />
            </div>
            <Separator />
        </div>
    )
} 