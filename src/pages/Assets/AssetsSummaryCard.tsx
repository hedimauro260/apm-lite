import { type ReactNode } from "react";
import {
  Coins,
  DollarSign,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "../../lib/utils";
import type { AssetsSummary } from "./assetsLogic";
import { AssetLogo } from "./AssetLogo";

interface CardConfig {
  title: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

function SummaryCard({
  title,
  icon,
  trend = "neutral",
  children,
}: CardConfig & { children: ReactNode }) {
  return (
    <div className="card p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            {title}
          </p>
          <div
            className={cn(
              "p-2 rounded",
              trend === "up"
                ? "bg-success/10 text-success"
                : trend === "down"
                  ? "bg-danger/10 text-danger"
                  : "bg-surface-elevated text-text-secondary",
            )}
          >
            {icon}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface AssetsSummaryCardProps {
  summary: AssetsSummary;
}

export function AssetsSummaryCard({ summary }: AssetsSummaryCardProps) {
  const { totalAssets, totalValue, bestPnl, worstPnl, largestAsset } = summary;

  return (
    <section className="pb-4 border-b border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Assets"
          icon={<Coins className="h-5 w-5" />}
        >
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            {totalAssets.toLocaleString()}{" "}
            <span className="text-xs font-medium text-text-muted">
              {totalAssets === 1 ? "Asset" : "Assets"}
            </span>
          </h3>
        </SummaryCard>

        <SummaryCard
          title="Total Value"
          icon={<DollarSign className="h-5 w-5" />}
          trend="up"
        >
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            {formatCurrency(totalValue)}
          </h3>
          <p className="mt-1 text-[10px] text-text-muted">All assets · USD</p>
        </SummaryCard>

        <SummaryCard
          title="Best PNL"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        >
          {bestPnl ? (
            <>
              <h3 className="text-base font-bold text-success tracking-tight">
                {formatCurrency(bestPnl.pnl)}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 min-w-0">
                <AssetLogo asset={bestPnl.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {bestPnl.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {formatPercentage(bestPnl.pnlPercent)}
                </span>
              </div>
            </>
          ) : (
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              —
            </h3>
          )}
        </SummaryCard>

        <SummaryCard
          title="Worst PNL"
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
        >
          {worstPnl ? (
            <>
              <h3 className="text-base font-bold text-danger tracking-tight">
                {formatCurrency(worstPnl.pnl)}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 min-w-0">
                <AssetLogo asset={worstPnl.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {worstPnl.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {formatPercentage(worstPnl.pnlPercent)}
                </span>
              </div>
            </>
          ) : (
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              —
            </h3>
          )}
        </SummaryCard>

        <SummaryCard
          title="Largest Asset"
          icon={<Layers className="h-5 w-5" />}
          trend="up"
        >
          {largestAsset ? (
            <>
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                {formatCurrency(largestAsset.currentValue)}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 min-w-0">
                <AssetLogo asset={largestAsset.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {largestAsset.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {largestAsset.participation.toFixed(1)}%
                </span>
              </div>
            </>
          ) : (
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              —
            </h3>
          )}
        </SummaryCard>
      </div>
    </section>
  );
}