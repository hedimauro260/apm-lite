import { type Wallet } from '../../types';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { ActionGroup, type ActionItem } from './ActionGroup';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Settings } from 'lucide-react';

export interface WalletCardProps {
    wallet: Wallet;
    totalPortfolioBalance: number;
    onAction?: (action: string, walletId: string) => void;
    className?: string;
}

export function WalletCard({ wallet, totalPortfolioBalance, onAction, className }: WalletCardProps) {
    const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);

    const actions: ActionItem[] = [
        { label: 'Add', icon: <ArrowUpRight />, onClick: () => onAction?.('add', wallet.id) },
        { label: 'Transfer', icon: <RefreshCw />, onClick: () => onAction?.('transfer', wallet.id) },
        { label: 'Withdraw', icon: <ArrowDownRight />, onClick: () => onAction?.('withdraw', wallet.id), variant: 'secondary' },
        { label: 'Settings', icon: <Settings />, onClick: () => onAction?.('settings', wallet.id), variant: 'ghost' },
    ];

    return (
        <div className={cn('card p-5 flex flex-col gap-4', className)}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <WalletIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary">{wallet.name}</h3>
                        <StatusBadge status={wallet.status} />
                    </div>
                </div>
            </div>

            {/* Balance */}
            <div>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(wallet.balance)}</p>
                <p className="text-xs text-text-muted mt-1">{percentage.toFixed(1)}% of total portfolio</p>
            </div>

            {/* Progress Bar */}
            <ProgressBar
                value={wallet.balance}
                max={totalPortfolioBalance}
                color={wallet.type === 'main' ? 'primary' : wallet.type === 'savings' ? 'success' : 'info'}
                showLabel={false}
            />

            {/* Actions */}
            <div className="pt-2 border-t border-border">
                <ActionGroup actions={actions} />
            </div>
        </div>
    );
}