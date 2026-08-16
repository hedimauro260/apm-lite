import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AssetEntity } from "../../types";
import { DropdownMenu } from "../../components/ui/DropdownMenu";

export interface AssetContextMenuProps {
    asset: AssetEntity;
    onEdit: (asset: AssetEntity) => void;
    onDelete: (asset: AssetEntity) => void;
}

const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors";

export function AssetContextMenu({
    asset,
    onEdit,
    onDelete,
}: AssetContextMenuProps) {
    return (
        <DropdownMenu button={<MoreHorizontal className="h-4 w-4" />}>
            <button
                type="button"
                onClick={() => onEdit(asset)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </button>
            <div className="my-1 border-t border-border" />
            <button
                type="button"
                onClick={() => onDelete(asset)}
                className={cn(menuItemClass, "text-danger hover:bg-danger/10")}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
            </button>
        </DropdownMenu>
    );
}
