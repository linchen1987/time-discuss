import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isDeleting: boolean
    entityType: 'post' | 'comment'
    title?: string
    description?: string
}

export function DeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
    entityType,
    title,
    description
}: DeleteDialogProps) {
    const defaultTitle = `确认删除${entityType === 'post' ? '帖子' : '评论'}`
    const defaultDescription = `确定要删除这篇${entityType === 'post' ? '帖子' : '评论'}吗？此操作无法撤销，${entityType === 'post' ? '帖子' : '评论'}的所有内容、图片${entityType === 'post' ? '、评论' : ''}和点赞都将被永久删除。`

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description || defaultDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        {isDeleting ? '删除中...' : '确认删除'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 