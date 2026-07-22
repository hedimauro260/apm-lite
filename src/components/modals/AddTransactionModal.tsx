// src/components/modals/AddTransactionModal.tsx
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { type Wallet } from '../../types';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    onSubmit: (data: {
        type: 'deposit' | 'withdraw' | 'transfer' | 'adjust';
        walletId: string;
        relatedWalletId?: string;
        amount: number;
        coin: string;
        status: 'completed' | 'pending' | 'failed';
        date: string;
        description?: string;
        website?: string;
    }) => void;
    initialType?: 'deposit' | 'withdraw' | 'transfer' | 'adjust';
    initialWalletId?: string;
}

const TX_TYPES = [
    { value: 'deposit', label: 'Deposit', color: '#22C55E' },
    { value: 'withdraw', label: 'Withdraw', color: '#EF4444' },
    { value: 'transfer', label: 'Transfer', color: '#3B82F6' },
    { value: 'adjust', label: 'Adjust', color: '#F59E0B' },
];

// ✅ Usar as const para garantir os tipos literais
const ADJUST_ACTIONS = [
    { value: 'add' as const, label: 'Add', icon: Plus, color: '#22C55E' },
    { value: 'remove' as const, label: 'Remove', icon: Minus, color: '#EF4444' },
];

const COINS = ['USD', 'EUR', 'GBP', 'BRL', 'BTC', 'ETH', 'SOL'];

export function AddTransactionModal({
    isOpen,
    onClose,
    wallets,
    onSubmit,
    initialType,
    initialWalletId
}: AddTransactionModalProps) {
    const [type, setType] = useState<'deposit' | 'withdraw' | 'transfer' | 'adjust'>('deposit');
    const [adjustAction, setAdjustAction] = useState<'add' | 'remove'>('add');
    const [walletId, setWalletId] = useState('');
    const [relatedWalletId, setRelatedWalletId] = useState('');
    const [amount, setAmount] = useState('');
    const [coin, setCoin] = useState('USD');
    const [status, setStatus] = useState<'completed' | 'pending' | 'failed'>('completed');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (initialType) setType(initialType);
            if (initialWalletId) setWalletId(initialWalletId);
            setAdjustAction('add');
        }
    }, [isOpen, initialType, initialWalletId]);

    const resetForm = () => {
        setType('deposit');
        setAdjustAction('add');
        setWalletId('');
        setRelatedWalletId('');
        setAmount('');
        setCoin('USD');
        setStatus('completed');
        setDate(new Date().toISOString().slice(0, 16));
        setDescription('');
        setWebsite('');
        setErrors({});
    };

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(resetForm, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!walletId) newErrors.walletId = 'Select a wallet';
        if (type === 'transfer' && !relatedWalletId) newErrors.relatedWalletId = 'Select destination wallet';
        if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        let finalAmount: number;

        if (type === 'adjust') {
            finalAmount = adjustAction === 'add'
                ? parseFloat(amount)
                : -parseFloat(amount);
        } else {
            finalAmount = type === 'deposit'
                ? parseFloat(amount)
                : -parseFloat(amount);
        }

        onSubmit({
            type,
            walletId,
            relatedWalletId: type === 'transfer' ? relatedWalletId : undefined,
            amount: finalAmount,
            coin,
            status,
            date: new Date(date).toISOString(),
            description: description.trim() || undefined,
            website: (type === 'deposit' || type === 'withdraw') ? website.trim() || undefined : undefined,
        });

        resetForm();
        onClose();
    };

    const showAdjustActions = type === 'adjust';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Transaction Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {TX_TYPES.map((txType) => (
                            <button
                                key={txType.value}
                                type="button"
                                onClick={() => {
                                    setType(txType.value as any);
                                    if (errors.walletId || errors.relatedWalletId) {
                                        setErrors({});
                                    }
                                }}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                                    type === txType.value
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-surface hover:border-border-light'
                                )}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: txType.color }}
                                />
                                <span className="text-xs font-medium text-text-primary">{txType.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Wallet Selection + Adjust Action */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {type === 'transfer' ? 'From Wallet *' : 'Wallet *'}
                        </label>
                        <div className="relative">
                            <select
                                value={walletId}
                                onChange={(e) => {
                                    setWalletId(e.target.value);
                                    if (errors.walletId) setErrors({ ...errors, walletId: '' });
                                }}
                                className={cn(
                                    'w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    errors.walletId && 'border-danger focus-visible:ring-danger'
                                )}
                            >
                                <option value="">Select wallet</option>
                                {wallets.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                        {errors.walletId && <p className="text-sm text-danger mt-1">{errors.walletId}</p>}
                    </div>

                    {/* Add/Remove para Adjust */}
                    {showAdjustActions && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Action *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ADJUST_ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    const isSelected = adjustAction === action.value;
                                    return (
                                        <button
                                            key={action.value}
                                            type="button"
                                            onClick={() => setAdjustAction(action.value)} // ✅ Agora funciona
                                            className={cn(
                                                'flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                                                isSelected
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border bg-surface hover:border-border-light'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4',
                                                    isSelected ? 'text-primary' : 'text-text-muted'
                                                )}
                                            />
                                            <span className={cn(
                                                'text-sm font-medium',
                                                isSelected ? 'text-text-primary' : 'text-text-secondary'
                                            )}>
                                                {action.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-text-muted mt-1.5">
                                {adjustAction === 'add'
                                    ? '➕ Adding funds to the wallet'
                                    : '➖ Removing funds from the wallet'}
                            </p>
                        </div>
                    )}

                    {!showAdjustActions && type === 'transfer' && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                To Wallet *
                            </label>
                            <div className="relative">
                                <select
                                    value={relatedWalletId}
                                    onChange={(e) => {
                                        setRelatedWalletId(e.target.value);
                                        if (errors.relatedWalletId) setErrors({ ...errors, relatedWalletId: '' });
                                    }}
                                    className={cn(
                                        'w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                        errors.relatedWalletId && 'border-danger focus-visible:ring-danger'
                                    )}
                                >
                                    <option value="">Select destination</option>
                                    {wallets.filter(w => w.id !== walletId).map((w) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                            </div>
                            {errors.relatedWalletId && <p className="text-sm text-danger mt-1">{errors.relatedWalletId}</p>}
                        </div>
                    )}

                    {!showAdjustActions && type !== 'transfer' && (
                        <div className="flex items-end">
                            <div className="w-full h-10 flex items-center text-text-muted text-sm border border-dashed border-border rounded-md px-4">
                                {type === 'deposit' ? '💰 Deposit transaction' : '🏦 Withdraw transaction'}
                            </div>
                        </div>
                    )}
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
                {(type === 'deposit' || type === 'withdraw') && (
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
                        Add Transaction
                    </Button>
                </div>
            </form>
        </Modal>
    );
}