import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActionMenuProps {
    onEdit?: () => void
    onDelete?: () => void
    isDeleting?: boolean
    canEdit?: boolean
    canDelete?: boolean
    stopPropagation?: (e: React.MouseEvent) => void
}

export function ActionMenu({
    onEdit,
    onDelete,
    isDeleting = false,
    canEdit = true,
    canDelete = true,
    stopPropagation
}: ActionMenuProps) {
    if (!canEdit && !canDelete) return null

    return (
        <div className="ml-auto" onClick={stopPropagation}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canEdit && onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                        </DropdownMenuItem>
                    )}
                    {canDelete && onDelete && (
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? '删除中...' : '删除'}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
} 