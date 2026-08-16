import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Site } from "../../types";
import { DropdownMenu } from "../../components/ui/DropdownMenu";

export interface SiteContextMenuProps {
    site: Site;
    onEdit: (site: Site) => void;
    onDelete: (site: Site) => void;
    onToggleStatus: (site: Site) => void;
}

const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors";

export function SiteContextMenu({
    site,
    onEdit,
    onDelete,
    onToggleStatus,
}: SiteContextMenuProps) {
    return (
        <DropdownMenu button={<MoreHorizontal className="h-4 w-4" />}>
            <button
                type="button"
                onClick={() => onEdit(site)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </button>
            <button
                type="button"
                onClick={() => onToggleStatus(site)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Power className="h-3.5 w-3.5" />
                {site.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <div className="my-1 border-t border-border" />
            <button
                type="button"
                onClick={() => onDelete(site)}
                className={cn(menuItemClass, "text-danger hover:bg-danger/10")}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
            </button>
        </DropdownMenu>
    );
}
