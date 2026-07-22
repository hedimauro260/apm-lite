import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Wallet } from '../../types';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
//import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { Plus, ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw, Settings, WalletMinimal } from 'lucide-react';

export interface WalletsModuleProps {
    wallets: Wallet[];
    totalPortfolioBalance: number;
    onAddWallet?: () => void;
    // ⚡ NOVA PROP: Ação rápida que abre o modal com parâmetros pré-definidos
    onQuickAction?: (type: 'deposit' | 'withdraw' | 'transfer' | 'adjust', walletId: string) => void;
}

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

    const getWalletColor = (type: string) => {
        switch (type) {
            case 'main': return 'bg-blue-500';
            case 'savings': return 'bg-purple-500';
            case 'trading': return 'bg-amber-500';
            case 'cold': return 'bg-teal-500';
            default: return 'bg-gray-500';
        }
    };

    const getWalletIconBg = (type: string) => {
        switch (type) {
            case 'main': return 'bg-blue-500/10 text-blue-500';
            case 'savings': return 'bg-purple-500/10 text-purple-500';
            case 'trading': return 'bg-amber-500/10 text-amber-500';
            case 'cold': return 'bg-teal-500/10 text-teal-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
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
                {/* Seta Esquerda */}
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
                    className="flex gap-4 overflow-x-auto custom-scrollbar px-6 "
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {wallets.map((wallet) => {
                        const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);
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
                                            <div className={cn('p-2 rounded-sm', getWalletIconBg(wallet.type))}>
                                                <WalletMinimal className="h-4 w-4" />
                                            </div>
                                            {/* Wallet Name */}
                                            <h3 className="font-semibold text-text-primary text-xs mb-1">{wallet.name}</h3>
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

                                    {/* ⚡ Action Buttons - Agora funcionais */}
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

                                    {/* Progress Bar */}
                                    <div className="mt-auto">
                                        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full transition-all', getWalletColor(wallet.type))}
                                                style={{ width: `${percentage}%` }}
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