// src/components/ui/WalletSummaryCard.tsx
import { type ReactNode } from "react";
import { cn, formatCurrency, formatPercentage } from "../../lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface WalletSummaryCardProps {
  title: string | ReactNode;
  value: number;
  variation?: number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  isCurrency?: boolean;
}

export function WalletSummaryCard({
  title,
  value,
  variation,
  icon,
  trend = "neutral",
  className,
  isCurrency = true,
}: WalletSummaryCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-danger"
        : "text-text-muted";

  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const displayValue = isCurrency
    ? formatCurrency(value)
    : value.toLocaleString();
  const displayVariation =
    variation !== undefined ? formatPercentage(variation) : undefined;

  return (
    <div
      className={cn("card p-4 flex flex-col justify-between h-full", className)}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
              {title}
            </p>
            <h3 className="text-xl font-bold text-text-primary tracking-tight">
              {displayValue}
            </h3>
          </div>
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

        {displayVariation && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium mb-0",
              trendColor,
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{displayVariation}</span>
            <span className="text-[10px] text-text-muted">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
}
