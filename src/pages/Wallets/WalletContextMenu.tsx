import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Wallet } from "../../types";
import { DropdownMenu } from "../../components/ui/DropdownMenu";

export interface WalletContextMenuProps {
    wallet: Wallet;
    onEdit: (wallet: Wallet) => void;
    onDelete: (wallet: Wallet) => void;
    onToggleStatus: (wallet: Wallet) => void;
}

const menuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors";

export function WalletContextMenu({
    wallet,
    onEdit,
    onDelete,
    onToggleStatus,
}: WalletContextMenuProps) {
    return (
        <DropdownMenu button={<MoreHorizontal className="h-4 w-4" />}>
            <button
                type="button"
                onClick={() => onEdit(wallet)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </button>
            <button
                type="button"
                onClick={() => onToggleStatus(wallet)}
                className={cn(menuItemClass, "text-text-primary hover:bg-surface")}
            >
                <Power className="h-3.5 w-3.5" />
                {wallet.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <div className="my-1 border-t border-border" />
            <button
                type="button"
                onClick={() => onDelete(wallet)}
                className={cn(menuItemClass, "text-danger hover:bg-danger/10")}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
            </button>
        </DropdownMenu>
    );
}
