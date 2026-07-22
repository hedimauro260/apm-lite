import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import type { Wallet, Transaction } from '../../types';
import { WalletContextMenu } from './WalletContextMenu';
import {
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Settings,
    Wallet as WalletIcon,
} from 'lucide-react';

export interface WalletCardExtendedProps {
    wallet: Wallet;
    totalPortfolioBalance: number;
    assetsCount: number;
    transactions: Transaction[];
    onAction: (action: string, walletId: string) => void;
    onEdit: (wallet: Wallet) => void;
    onDelete: (wallet: Wallet) => void;
    onToggleStatus: (wallet: Wallet) => void;
}

// Cores para as barras do gráfico
const BAR_COLORS = ['#22C55E', '#06B6D4', '#A3E635', '#10B981', '#14B8A6', '#84CC16'];

// Cores dos ícones de ação
const ACTION_COLORS = {
    add: 'text-success hover:bg-success/10',
    transfer: 'text-purple-500 hover:bg-purple-500/10',
    withdraw: 'text-danger hover:bg-danger/10',
    adjust: 'text-text-muted hover:bg-surface',
};

export function WalletCardExtended({
    wallet,
    totalPortfolioBalance,
    assetsCount,
    transactions,
    onAction,
    onEdit,
    onDelete,
    onToggleStatus,
}: WalletCardExtendedProps) {
    const percentage = calculatePercentage(wallet.balance, totalPortfolioBalance);

    // Filtrar apenas transações positivas para o gráfico
    const chartData = useMemo(() => {
        const positiveTxs = transactions
            .filter((t) => t.walletId === wallet.id && t.amount > 0)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-12); // Últimas 12 transações positivas

        return positiveTxs.map((t, index) => ({
            id: t.id,
            value: t.amount,
            color: BAR_COLORS[index % BAR_COLORS.length],
        }));
    }, [transactions, wallet.id]);

    // Valor máximo para escala do gráfico
    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        return Math.max(...chartData.map((d) => d.value)) * 1.2;
    }, [chartData]);

    const getWalletColor = (type: string) => {
        switch (type) {
            case 'main':
                return 'bg-blue-500/10 text-blue-500';
            case 'savings':
                return 'bg-purple-500/10 text-purple-500';
            case 'trading':
                return 'bg-amber-500/10 text-amber-500';
            case 'cold':
                return 'bg-teal-500/10 text-teal-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getProgressColor = (type: string) => {
        switch (type) {
            case 'main':
                return 'bg-blue-500';
            case 'savings':
                return 'bg-purple-500';
            case 'trading':
                return 'bg-amber-500';
            case 'cold':
                return 'bg-teal-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="card p-4 flex flex-col gap-4 h-full">
            {/* Header: Ícone + Nome + Status + Menu */}
            <div className="flex items-start justify-between border border-amber-200">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', getWalletColor(wallet.type))}>
                        <WalletIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-text-primary">{wallet.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'px-2.5 py-1 rounded-md text-[10px] font-medium',
                            wallet.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-surface-elevated text-text-muted'
                        )}
                    >
                        {wallet.status}
                    </span>
                    <WalletContextMenu
                        wallet={wallet}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                    />
                </div>
            </div>

            {/* Valor Total */}
            <div>
                <p className="text-3xl font-bold text-text-primary tracking-tight">
                    {formatCurrency(wallet.balance)}
                </p>
            </div>

            {/* Assets Count */}
            <p className="text-sm text-text-muted">{assetsCount} Assets</p>

            {/* Percentual + Gráfico de Barras */}
            <div className="flex items-end justify-between gap-4">
                <div className="shrink-0">
                    <p className="text-xl font-semibold text-text-primary">
                        {percentage.toFixed(2).replace('.', ',')}%
                    </p>
                    <p className="text-sm text-text-muted">of Portfolio</p>
                </div>

                {/* Gráfico de Barras Vertical */}
                <div className="flex-1 h-16 min-w-0">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                barCategoryGap="20%"
                            >
                                {/* ✅ XAxis escondido - quantidade de barras = chartData.length */}
                                <XAxis hide />

                                {/* ✅ YAxis escondido, mas mantém o domínio para a referência */}
                                <YAxis hide domain={[0, maxChartValue]} />

                                {/* ✅ Linha de base em zero (sutil) */}
                                <ReferenceLine
                                    y={0}
                                    stroke="#374151"
                                    strokeDasharray="3 3"
                                    strokeWidth={1}
                                />

                                <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        // Estado vazio: linha tracejada horizontal
                        <div className="h-full flex items-center">
                            <div className="w-full border-t border-dashed border-border" />
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar Horizontal (sem texto) */}
            <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', getProgressColor(wallet.type))}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-auto">
                <button
                    onClick={() => onAction('deposit', wallet.id)}
                    className={cn(
                        'flex items-center justify-center p-3 rounded-lg bg-surface-elevated transition-colors',
                        ACTION_COLORS.add
                    )}
                    title="Add Funds"
                >
                    <ArrowUpRight className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onAction('transfer', wallet.id)}
                    className={cn(
                        'flex items-center justify-center p-3 rounded-lg bg-surface-elevated transition-colors',
                        ACTION_COLORS.transfer
                    )}
                    title="Transfer"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onAction('withdraw', wallet.id)}
                    className={cn(
                        'flex items-center justify-center p-3 rounded-lg bg-surface-elevated transition-colors',
                        ACTION_COLORS.withdraw
                    )}
                    title="Withdraw"
                >
                    <ArrowDownRight className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onAction('adjust', wallet.id)}
                    className={cn(
                        'flex items-center justify-center p-3 rounded-lg bg-surface-elevated transition-colors',
                        ACTION_COLORS.adjust
                    )}
                    title="Adjust"
                >
                    <Settings className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}