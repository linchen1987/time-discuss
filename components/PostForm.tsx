"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"

export function PostForm() {
    const { data: session } = useSession()
    type UserWithAvatar = { avatarUrl?: string | null; name?: string | null };
    const user = session?.user as UserWithAvatar | undefined
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await createPost(content.trim())
            setContent("")
            toast.success("发布成功！")
        } catch (err) {
            console.error("Failed to create post:", err)
            const errorMessage = err instanceof Error ? err.message : "发布失败，请稍后重试"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    if (!session) return null

    return (
        <div className="border-b border-border">
            <div className="p-4">
                <div className="flex space-x-3">
                    <Avatar>
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback>
                            {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                placeholder="有什么新鲜事？"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="min-h-[120px] resize-none border-none p-0 text-xl placeholder:text-muted-foreground focus-visible:ring-0"
                                maxLength={280}
                            />

                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    {content.length}/280
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!content.trim() || isSubmitting}
                                    className="rounded-full"
                                >
                                    {isSubmitting ? "发布中..." : "发布"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Separator />
        </div>
    )
} 