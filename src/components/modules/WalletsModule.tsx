// src/components/modules/WalletsModule.tsx
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Wallet } from '../../types';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Plus, ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw, Settings, WalletMinimal } from 'lucide-react';

export interface WalletsModuleProps {
    wallets: Wallet[];
    totalPortfolioBalance: number;
    onAddWallet?: () => void;
    onQuickAction?: (type: 'deposit' | 'withdraw' | 'transfer' | 'adjust', walletId: string) => void;
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

const DEFAULT_COLOR = '#7C5CFC';

export function WalletsModule({ wallets, totalPortfolioBalance, onAddWallet, onQuickAction }: WalletsModuleProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // ✅ Função para obter a cor da wallet
    const getWalletColor = (wallet: Wallet) => {
        return wallet.color || typeColors[wallet.type] || DEFAULT_COLOR;
    };

    // ✅ Estilo do ícone com a cor da wallet
    const getIconStyle = (wallet: Wallet) => {
        const color = getWalletColor(wallet);
        return {
            backgroundColor: `${color}15`,
            color: color,
        };
    };

    // ✅ Estilo da barra de progresso
    const getProgressStyle = (wallet: Wallet) => {
        const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);
        const color = getWalletColor(wallet);
        return {
            backgroundColor: color,
            width: `${Math.min(percentage, 100)}%`,
        };
    };

    return (
        <div className="card h-full flex flex-col justify-center">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary">Wallets</h2>
                <Button variant="primary" size="sm" onClick={onAddWallet}>
                    <Plus className="h-4 w-4" />
                    Add
                </Button>
            </div>

            {/* Content - Scroll Horizontal */}
            <div className="flex-1 flex items-center relative overflow-hidden">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-surface-elevated border border-border rounded-full shadow-lg hover:bg-border transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-text-primary rotate-180" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto custom-scrollbar px-6"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {wallets.map((wallet) => {
                        const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);
                        const iconStyle = getIconStyle(wallet);
                        const progressStyle = getProgressStyle(wallet);

                        return (
                            <div
                                key={wallet.id}
                                className="shrink-0 w-64"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="bg-surface-elevated border border-border rounded-lg p-4 h-full flex flex-col">
                                    {/* Wallet Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="p-2 rounded-sm transition-colors"
                                                style={iconStyle}
                                            >
                                                <WalletMinimal className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold text-text-primary text-xs mb-1">
                                                {wallet.name}
                                            </h3>
                                        </div>
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-xs font-medium',
                                            wallet.status === 'active' ? 'bg-success/10 text-success' : 'bg-surface text-text-muted'
                                        )}>
                                            {wallet.status}
                                        </span>
                                    </div>

                                    {/* Balance */}
                                    <p className="text-xl font-bold text-text-primary mb-1">
                                        {formatCurrency(wallet.balance)}
                                    </p>
                                    <p className="text-[12px] text-text-muted mb-4">
                                        {percentage.toFixed(2)}% of portfolio
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1 mb-4">
                                        <button
                                            onClick={() => onQuickAction?.('deposit', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Add Funds (Deposit)"
                                        >
                                            <ArrowUpRight className="h-4 w-4 text-success mx-auto" />
                                        </button>
                                        <button
                                            onClick={() => onQuickAction?.('transfer', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Transfer"
                                        >
                                            <RefreshCw className="h-4 w-4 text-primary mx-auto" />
                                        </button>
                                        <button
                                            onClick={() => onQuickAction?.('withdraw', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Withdraw"
                                        >
                                            <ArrowDownRight className="h-4 w-4 text-danger mx-auto" />
                                        </button>
                                        <button
                                            onClick={() => onQuickAction?.('adjust', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Adjust"
                                        >
                                            <Settings className="h-4 w-4 text-text-muted mx-auto" />
                                        </button>
                                    </div>

                                    {/* ✅ Progress Bar com cor personalizada */}
                                    <div className="mt-auto">
                                        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={progressStyle}
                                            />
                                        </div>
                                        <p className="text-xs text-text-muted mt-1.5 text-right">
                                            {percentage.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Seta Direita */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-surface-elevated border border-border rounded-full shadow-lg hover:bg-border transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-text-primary" />
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-3">
                <Link
                    to="/wallets"
                    className="flex items-center justify-between text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    <span>View all wallets</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}