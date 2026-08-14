import { Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { cn, formatCurrency, formatDateTime } from "../../lib/utils";
import type { SiteMovement } from "../../types";

export interface DeleteMovementModalProps {
    open: boolean;
    movement?: SiteMovement;
    siteName?: string;
    onClose: () => void;
    onConfirm: (movement: SiteMovement) => void;
}

export function DeleteMovementModal({
    open,
    movement,
    siteName,
    onClose,
    onConfirm,
}: DeleteMovementModalProps) {
    const isEarn = movement?.type === "earn";

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Delete Movement"
            variant="danger"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => movement && onConfirm(movement)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Are you sure you want to delete this movement?{" "}
                    <span className="text-text-primary font-medium">
                        The site balance will be recalculated.
                    </span>
                </p>

                {movement && (
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-elevated border border-border px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">
                                {siteName ?? "Site"}
                            </p>
                            <p className="text-xs text-text-muted">
                                {formatDateTime(movement.date)}
                            </p>
                        </div>
                        <span
                            className={cn(
                                "text-sm font-bold font-mono shrink-0",
                                isEarn ? "text-success" : "text-danger"
                            )}
                        >
                            {isEarn ? "+" : "-"}
                            {formatCurrency(movement.amount)}
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
}
