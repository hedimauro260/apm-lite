import { type ReactNode } from "react";
import {
  Coins,
  DollarSign,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../../lib/utils";
import type { AssetsSummary } from "./assetsLogic";
import { AssetLogo } from "./AssetLogo";

interface CardProps {
  title: string;
  value: ReactNode;
  secondary?: ReactNode;
  icon: ReactNode;
  color: string;
}

function SummaryCard({ title, value, secondary, icon, color }: CardProps) {
  return (
    <div className="card p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {title}
            </p>
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              {value}
            </h3>
          </div>
          <div
            className="p-2 rounded shrink-0"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            {icon}
          </div>
        </div>
        {secondary && (
          <div className="flex items-center gap-1 text-xs font-medium text-text-muted min-w-0">
            {secondary}
          </div>
        )}
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
          value={
            <>
              {totalAssets.toLocaleString()}{" "}
              <span className="text-xs font-medium text-text-muted">
                {totalAssets === 1 ? "Asset" : "Assets"}
              </span>
            </>
          }
          secondary="Tracked assets"
          icon={<Coins className="h-5 w-5" />}
          color="#7C5CFC"
        />

        <SummaryCard
          title="Total Portfolio"
          value={formatCurrency(totalValue)}
          secondary="All assets USD"
          icon={<DollarSign className="h-5 w-5" />}
          color="#38BDF8"
        />

        <SummaryCard
          title="Best PNL"
          value={
            bestPnl ? (
              <span className="text-success">{formatCurrency(bestPnl.pnl)}</span>
            ) : (
              "—"
            )
          }
          secondary={
            bestPnl ? (
              <span className="flex items-center gap-2 min-w-0">
                <AssetLogo asset={bestPnl.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {bestPnl.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {formatPercentage(bestPnl.pnlPercent)}
                </span>
              </span>
            ) : undefined
          }
          icon={<TrendingUp className="h-5 w-5" />}
          color="#22C55E"
        />

        <SummaryCard
          title="Worst PNL"
          value={
            worstPnl ? (
              <span className="text-danger">{formatCurrency(worstPnl.pnl)}</span>
            ) : (
              "—"
            )
          }
          secondary={
            worstPnl ? (
              <span className="flex items-center gap-2 min-w-0">
                <AssetLogo asset={worstPnl.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {worstPnl.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {formatPercentage(worstPnl.pnlPercent)}
                </span>
              </span>
            ) : undefined
          }
          icon={<TrendingDown className="h-5 w-5" />}
          color="#EF4444"
        />

        <SummaryCard
          title="Largest Asset"
          value={
            largestAsset
              ? formatCurrency(largestAsset.currentValue)
              : "—"
          }
          secondary={
            largestAsset ? (
              <span className="flex items-center gap-2 min-w-0">
                <AssetLogo asset={largestAsset.asset} size="sm" />
                <span className="text-xs text-text-secondary truncate">
                  {largestAsset.asset.symbol}
                </span>
                <span className="text-[10px] text-text-muted shrink-0">
                  {largestAsset.participation.toFixed(1)}%
                </span>
              </span>
            ) : undefined
          }
          icon={<Layers className="h-5 w-5" />}
          color="#F59E0B"
        />
      </div>
    </section>
  );
}