import { type Asset } from '../../types';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import { ProgressBar } from './ProgressBar';
import { getCryptoColor } from '../../lib/utils';

export interface AssetCardProps {
    asset: Asset;
    totalPortfolioBalance: number;
    className?: string;
}

export function AssetCard({ asset, totalPortfolioBalance, className }: AssetCardProps) {
    const percentage = calculatePercentage(asset.currentValue, totalPortfolioBalance);
    const colorClass = getCryptoColor(asset.symbol);

    return (
        <div className={cn('flex items-center gap-4 p-4 bg-surface-elevated border border-border rounded-lg hover:bg-surface transition-colors', className)}>
            {/* Icon */}
            <div className={cn('flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm', colorClass, 'bg-opacity-10')}>
                {asset.symbol.slice(0, 2)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-text-primary truncate">{asset.name}</h4>
                    <span className="font-bold text-text-primary">{formatCurrency(asset.currentValue)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{asset.quantity} {asset.symbol}</span>
                    <span>{percentage.toFixed(1)}% of portfolio</span>
                </div>
                <div className="mt-2">
                    <ProgressBar value={percentage} max={100} color="primary" showLabel={false} className="h-1.5" />
                </div>
            </div>
        </div>
    );
}