import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Site } from "../../types";

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
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded transition-colors"
                title="Options"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-10 w-44 bg-surface-elevated border border-border rounded-lg shadow-lg py-1">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onEdit(site);
                        }}
                        className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onToggleStatus(site);
                        }}
                        className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
                    >
                        <Power className="h-3.5 w-3.5" />
                        {site.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onDelete(site);
                        }}
                        className={cn(menuItemClass, "text-danger hover:bg-danger/10")}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
