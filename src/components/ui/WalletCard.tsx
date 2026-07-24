// src/components/ui/WalletCard.tsx
import { type Wallet } from '../../types';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import { StatusBadge } from './StatusBadge';
import { ActionGroup, type ActionItem } from './ActionGroup';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Settings } from 'lucide-react';

export interface WalletCardProps {
    wallet: Wallet;
    totalPortfolioBalance: number;
    onAction?: (action: string, walletId: string) => void;
    className?: string;
}

// ✅ Paleta de cores por tipo (fallback)
const typeColors: Record<string, string> = {
    main: '#7C5CFC',
    savings: '#22C55E',
    trading: '#F59E0B',
    cold: '#3B82F6',
    exchange: '#F97316',
    hot: '#EC4899',
    micro: '#8B5CF6',
    bank: '#14B8A6',
    cash: '#10B981',
    other: '#6B7280',
};

// ✅ Cor padrão (caso tudo falhe)
const DEFAULT_COLOR = '#7C5CFC';

export function WalletCard({ wallet, totalPortfolioBalance, onAction, className }: WalletCardProps) {
    const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);

    const actions: ActionItem[] = [
        { label: 'Add', icon: <ArrowUpRight />, onClick: () => onAction?.('add', wallet.id) },
        { label: 'Transfer', icon: <RefreshCw />, onClick: () => onAction?.('transfer', wallet.id) },
        { label: 'Withdraw', icon: <ArrowDownRight />, onClick: () => onAction?.('withdraw', wallet.id), variant: 'secondary' },
        { label: 'Settings', icon: <Settings />, onClick: () => onAction?.('settings', wallet.id), variant: 'ghost' },
    ];

    // ✅ Usa a cor personalizada ou a cor do tipo, com fallback para a cor padrão
    const walletColor = wallet.color || typeColors[wallet.type] || DEFAULT_COLOR;

    // ✅ DEBUG: Verificar no console qual cor está sendo usada
    console.log(`🎨 Wallet: ${wallet.name}`, {
        colorFromWallet: wallet.color,
        type: wallet.type,
        typeColor: typeColors[wallet.type],
        finalColor: walletColor,
    });

    // ✅ Estilo do ícone com a cor da wallet
    const iconStyle = {
        backgroundColor: `${walletColor}15`, // 15% de opacidade
        color: walletColor,
        borderColor: `${walletColor}30`, // 30% de opacidade para borda
        borderWidth: '1px',
    };

    return (
        <div className={cn('card p-5 flex flex-col gap-4', className)}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {/* ✅ Ícone com cor personalizada */}
                    <div
                        className="p-2 rounded-lg transition-colors"
                        style={iconStyle}
                    >
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

            {/* ✅ Progress Bar com cor personalizada */}
            <div className="w-full">
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: walletColor,
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border">
                <ActionGroup actions={actions} />
            </div>
        </div>
    );
}