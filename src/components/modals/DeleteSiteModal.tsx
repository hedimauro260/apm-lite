import { Globe, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatCurrency } from "../../lib/utils";
import type { Site } from "../../types";

export interface DeleteSiteModalProps {
    open: boolean;
    site?: Site;
    movementCount: number;
    onClose: () => void;
    onConfirm: (site: Site) => void;
}

export function DeleteSiteModal({
    open,
    site,
    movementCount,
    onClose,
    onConfirm,
}: DeleteSiteModalProps) {
    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Delete Site"
            variant="danger"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => site && onConfirm(site)}>
                        <Trash2 className="h-4 w-4" />
                        Delete Site
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Are you sure you want to delete this site?{" "}
                    <span className="text-text-primary font-medium">
                        This action cannot be undone.
                    </span>{" "}
                    All {movementCount}{" "}
                    {movementCount === 1 ? "movement" : "movements"} associated with{" "}
                    {site?.name ?? "this site"} will be permanently deleted.
                </p>

                {site && (
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-elevated border border-border px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="p-2 rounded-md shrink-0"
                                style={{
                                    backgroundColor: site.color
                                        ? `${site.color}15`
                                        : undefined,
                                    color: site.color,
                                }}
                            >
                                <Globe className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {site.name}
                                </p>
                                <p className="text-xs text-text-muted">Current balance</p>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-text-primary shrink-0">
                            {formatCurrency(site.balance)}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
