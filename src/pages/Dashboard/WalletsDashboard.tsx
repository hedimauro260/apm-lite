import { Link } from 'react-router-dom';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    Plus,
    RefreshCw,
    Settings,
    WalletMinimal,
} from 'lucide-react';
import { type Wallet } from '../../types';
import { calculatePercentage, cn, formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

const typeColors: Record<Wallet['type'], string> = {
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

type QuickAction = 'deposit' | 'withdraw' | 'transfer' | 'adjust';

interface WalletsDashboardProps {
    wallets?: Wallet[];
    onAddWallet?: () => void;
    onQuickAction?: (type: QuickAction, walletId: string) => void;
}

export function WalletsDashboard({
    wallets: walletsProp,
    onAddWallet,
    onQuickAction,
}: WalletsDashboardProps) {
    const wallets = walletsProp ?? [];
    const totalPortfolioBalance = wallets.reduce((total, wallet) => total + wallet.balance, 0);

    const handleAddWallet = () => {
        onAddWallet?.();
    };

    const handleQuickAction = (type: QuickAction, walletId: string) => {
        onQuickAction?.(type, walletId);
    };

    const getWalletColor = (wallet: Wallet) => wallet.color || typeColors[wallet.type] || DEFAULT_COLOR;

    const getIconStyle = (wallet: Wallet) => {
        const color = getWalletColor(wallet);

        return {
            backgroundColor: `${color}15`,
            color,
        };
    };

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
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h2 className="text-xs font-semibold text-text-primary">Wallets</h2>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="xs" onClick={() => onQuickAction?.('deposit', wallets[0]?.id ?? '')}>
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                    <Button variant="primary" size="xs" onClick={handleAddWallet}>
                        <Plus className="h-4 w-4" />
                        Add Wallet
                    </Button>
                </div>
            </div>

            <div className="py-6 flex-1 flex items-center relative overflow-hidden md:py-0">
                <div
                    className="flex overflow-x-auto custom-scrollbar"
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
                                <div className="bg-surface-elevated border border-border rounded-lg p-4 h-full flex flex-col ml-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="p-2 rounded-sm transition-colors"
                                                style={iconStyle}
                                            >
                                                <WalletMinimal className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold text-text-primary text-xs">
                                                {wallet.name}
                                            </h3>
                                        </div>
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded text-[10px] font-medium',
                                                wallet.status === 'active'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-surface text-text-muted'
                                            )}
                                        >
                                            {wallet.status}
                                        </span>
                                    </div>

                                    <p className="text-base font-bold text-text-primary mb-1">
                                        {formatCurrency(wallet.balance)}
                                    </p>
                                    <p className="text-[10px] text-text-muted mb-4">
                                        {percentage.toFixed(2)}% of portfolio
                                    </p>

                                    <div className="flex gap-1 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction('deposit', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Add Funds (Deposit)"
                                        >
                                            <ArrowUpRight className="h-4 w-4 text-success mx-auto" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction('transfer', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Transfer"
                                        >
                                            <RefreshCw className="h-4 w-4 text-primary mx-auto" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction('withdraw', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Withdraw"
                                        >
                                            <ArrowDownRight className="h-4 w-4 text-danger mx-auto" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAction('adjust', wallet.id)}
                                            className="flex-1 p-2 bg-surface rounded hover:bg-border transition-colors group"
                                            title="Adjust"
                                        >
                                            <Settings className="h-4 w-4 text-text-muted mx-auto" />
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={progressStyle}
                                            />
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-1.5 text-right">
                                            {percentage.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-border px-6 py-3">
                <Link
                    to="/wallets"
                    className="flex items-center justify-between text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    <span>View all wallets</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
