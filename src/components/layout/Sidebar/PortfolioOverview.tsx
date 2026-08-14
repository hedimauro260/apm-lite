// src/components/layout/Sidebar/PortfolioOverview.tsx (com tooltip)
import { formatCurrency, formatPercentage } from '../../../lib/utils';
import { TrendingUp, Wallet } from 'lucide-react';
import { cn } from "../../../lib/utils";
import { useState } from 'react';

export interface PortfolioOverviewProps {
    totalBalance: number;
    variation: number;
    change?: number;
    isOpen?: boolean;
}

export function PortfolioOverview({
    totalBalance,
    variation,
    isOpen = true
}: PortfolioOverviewProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className={cn(
            "mx-3 px-3 py-3 bg-surface-elevated border border-border rounded-lg transition-all duration-300 relative",
            isOpen ? "mb-6" : "mb-3 flex justify-center"
        )}>
            {isOpen ? (
                // ✅ Versão completa
                <div>
                    <p className="text-xs font-medium text-text-muted tracking-wider">
                        Total Balance
                    </p>
                    <div className="flex items-end mt-2">
                        <h3 className="text-xl font-bold text-text-primary">
                            {formatCurrency(totalBalance)}
                        </h3>
                        <div className="ml-2 flex items-center gap-1.5 text-xs font-medium text-success">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>{formatPercentage(variation)}</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-text-muted tracking-wider">vs yesterday</p>
                </div>
            ) : (
                // ✅ Versão com tooltip
                <div
                    className="relative flex flex-col items-center"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Wallet className="h-6 w-6 text-primary/60" />


                    {/* Tooltip */}
                    {showTooltip && (
                        <div className="absolute -left-3 bottom-full mb-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg shadow-dropdown whitespace-nowrap z-50">
                            <p className="text-xs text-text-muted">Total Balance</p>
                            <p className="text-sm font-bold text-text-primary">
                                {formatCurrency(totalBalance)}
                            </p>
                            <p className="text-xs text-success">
                                ↑ {formatPercentage(variation)} vs yesterday
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}