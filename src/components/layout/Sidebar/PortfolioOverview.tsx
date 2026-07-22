//src\components\layout\Sidebar\PortfolioOverview.tsx
import { formatCurrency, formatPercentage } from '../../../lib/utils';
import { TrendingUp } from 'lucide-react';


export interface PortfolioOverviewProps {
    totalBalance: number;
    variation: number;
    change?: number;
}

export function PortfolioOverview({ totalBalance, variation }: PortfolioOverviewProps) {
    return (
        <div className="mx-4 px-3 py-4 bg-surface-elevated border border-border rounded-lg mb-6">
            <p className="text-xs font-medium text-text-muted tracking-wider mb-2">
                Total Balance
            </p>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
                {formatCurrency(totalBalance)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-medium text-success mb-3">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{formatPercentage(variation)}</span>
                <span className="text-[10px] text-text-muted">vs yesterday</span>
            </div>

        </div>
    );
}
