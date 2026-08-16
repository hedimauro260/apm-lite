import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AssetMovement } from "../../types";
import { DropdownMenu } from "../../components/ui/DropdownMenu";

export interface MovementContextMenuProps {
    movement: AssetMovement;
    onEdit: (movement: AssetMovement) => void;
    onDelete: (movement: AssetMovement) => void;
}

const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors";

export function MovementContextMenu({
    movement,
    onEdit,
    onDelete,
}: MovementContextMenuProps) {
    return (
        <DropdownMenu button={<MoreHorizontal className="h-4 w-4" />}>
            <button
                type="button"
                onClick={() => onEdit(movement)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </button>
            <div className="my-1 border-t border-border" />
            <button
                type="button"
                onClick={() => onDelete(movement)}
                className={cn(menuItemClass, "text-danger hover:bg-danger/10")}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
            </button>
        </DropdownMenu>
    );
}
