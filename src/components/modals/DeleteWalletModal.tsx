import { Wallet as WalletIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatCurrency } from "../../lib/utils";
import type { Wallet } from "../../types";

export interface DeleteWalletModalProps {
    open: boolean;
    wallet?: Wallet;
    onClose: () => void;
    onConfirm: (wallet: Wallet) => void;
}

export function DeleteWalletModal({
    open,
    wallet,
    onClose,
    onConfirm,
}: DeleteWalletModalProps) {
    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Delete Wallet"
            variant="danger"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => wallet && onConfirm(wallet)}>
                        Delete Wallet
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    Are you sure you want to delete this wallet?{" "}
                    <span className="text-text-primary font-medium">
                        This action cannot be undone.
                    </span>{" "}
                    All transactions associated with {wallet?.name ?? "this wallet"}{" "}
                    will be permanently deleted.
                </p>

                {wallet && (
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-elevated border border-border px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="p-2 rounded-md shrink-0"
                                style={{
                                    backgroundColor: wallet.color
                                        ? `${wallet.color}15`
                                        : undefined,
                                    color: wallet.color,
                                }}
                            >
                                <WalletIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {wallet.name}
                                </p>
                                <p className="text-xs text-text-muted">Wallet balance</p>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-text-primary shrink-0">
                            {formatCurrency(wallet.balance)}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}