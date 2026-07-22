import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Transaction, Wallet } from '../../types';
import { ChevronDown } from 'lucide-react';
//import { cn } from '../../lib/utils';

export interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    wallets: Wallet[];
    onSubmit: (data: Partial<Transaction>) => void;
}

const COINS = ['USD', 'EUR', 'GBP', 'BRL', 'BTC', 'ETH', 'SOL'];

export function EditTransactionModal({ isOpen, onClose, transaction, wallets, onSubmit }: EditTransactionModalProps) {
    const [amount, setAmount] = useState('');
    const [coin, setCoin] = useState('USD');
    const [status, setStatus] = useState<'completed' | 'pending' | 'failed'>('completed');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (transaction && isOpen) {
            setAmount(Math.abs(transaction.amount).toString());
            setCoin(transaction.coin);
            setStatus(transaction.status);
            setDate(transaction.date.slice(0, 16));
            setDescription(transaction.description || '');
            setWebsite(transaction.website || '');
            setErrors({});
        }
    }, [transaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const originalSign = transaction && transaction.amount < 0 ? -1 : 1;

        onSubmit({
            id: transaction!.id,
            amount: parseFloat(amount) * originalSign,
            coin,
            status,
            date: new Date(date).toISOString(),
            description: description.trim() || undefined,
            website: website.trim() || undefined,
            updatedAt: new Date().toISOString(),
        });

        onClose();
    };

    if (!transaction) return null;

    const wallet = wallets.find(w => w.id === transaction.walletId);
    const isDepositOrWithdraw = transaction.type === 'deposit' || transaction.type === 'withdraw';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Info */}
                <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                    <p className="text-sm text-text-muted">Wallet</p>
                    <p className="text-lg font-semibold text-text-primary">{wallet?.name || 'Unknown'}</p>
                    <p className="text-xs text-text-muted mt-1 capitalize">{transaction.type}</p>
                </div>

                {/* Amount & Coin */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Amount *"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (errors.amount) setErrors({ ...errors, amount: '' });
                        }}
                        error={errors.amount}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Coin *
                        </label>
                        <div className="relative">
                            <select
                                value={coin}
                                onChange={(e) => setCoin(e.target.value)}
                                className="w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {COINS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Date & Status */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date & Time"
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <Input
                    label="Description (optional)"
                    placeholder="e.g., Salary, ATM withdrawal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Website */}
                {isDepositOrWithdraw && (
                    <Input
                        label="Website (optional)"
                        placeholder="e.g., bank.example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}