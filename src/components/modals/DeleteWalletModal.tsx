import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { type Wallet } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { AlertTriangle } from 'lucide-react';

export interface DeleteWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: Wallet | null;
    onConfirm: (walletId: string) => void;
}

export function DeleteWalletModal({ isOpen, onClose, wallet, onConfirm }: DeleteWalletModalProps) {
    if (!wallet) return null;

    const handleConfirm = () => {
        onConfirm(wallet.id);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Wallet" size="md">
            <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-danger shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">
                            Are you sure you want to delete this wallet?
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                            This action cannot be undone. All transactions associated with{' '}
                            <strong>{wallet.name}</strong> will be permanently deleted.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                    <p className="text-sm text-text-muted">Wallet</p>
                    <p className="text-lg font-semibold text-text-primary">{wallet.name}</p>
                    <p className="text-sm text-text-muted mt-1">
                        Balance: {formatCurrency(wallet.balance)}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={handleConfirm}>
                        Delete Wallet
                    </Button>
                </div>
            </div>
        </Modal>
    );
}