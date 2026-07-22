import { type ReactNode } from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface AssetMetricCardProps {
    label: string;
    value: string | number;
    subValue?: string; // Ex: Nome do ativo ou % de variação
    icon: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    isCurrency?: boolean;
    className?: string;
}

export function AssetMetricCard({
    label,
    value,
    subValue,
    icon,
    trend = 'neutral',
    isCurrency = true,
    className,
}: AssetMetricCardProps) {
    const trendColor =
        trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    const displayValue = isCurrency && typeof value === 'number'
        ? formatCurrency(value)
        : typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div className={cn('bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 h-full', className)}>
            {/* Header com Label e Ícone */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {label}
                </span>
                <div className={cn(
                    'p-2 rounded-lg',
                    trend === 'up' ? 'bg-success/10 text-success' :
                        trend === 'down' ? 'bg-danger/10 text-danger' :
                            'bg-surface-elevated text-text-secondary'
                )}>
                    {icon}
                </div>
            </div>

            {/* Valor Principal */}
            <div>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                    {displayValue}
                </h3>

                {/* Sub-valor (Nome do ativo ou PNL %) */}
                {subValue && (
                    <div className={cn('flex items-center gap-1.5 mt-2 text-xs font-medium', trendColor)}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        <span>{subValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
}