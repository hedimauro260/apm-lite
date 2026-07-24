// src/components/modules/WalletCardExtended.tsx
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn, formatCurrency, calculatePercentage } from "../../lib/utils";
import type { Wallet, Transaction } from "../../types";
import { WalletContextMenu } from "./WalletContextMenu";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Wallet as WalletIcon,
} from "lucide-react";

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

const BAR_COLORS = [
  "#22C55E",
  "#06B6D4",
  "#A3E635",
  "#10B981",
  "#14B8A6",
  "#84CC16",
];

const ACTION_COLORS = {
  add: "text-success hover:bg-success/10",
  transfer: "text-purple-500 hover:bg-purple-500/10",
  withdraw: "text-danger hover:bg-danger/10",
  adjust: "text-text-muted hover:bg-surface",
};

// Paleta de cores por tipo (fallback)
const typeColors: Record<string, string> = {
  main: "#7C5CFC",
  savings: "#22C55E",
  trading: "#F59E0B",
  cold: "#3B82F6",
  exchange: "#F97316",
  hot: "#EC4899",
  micro: "#8B5CF6",
  bank: "#14B8A6",
  cash: "#10B981",
  other: "#6B7280",
};

const DEFAULT_COLOR = "#7C5CFC";

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

  // Usa a cor personalizada ou a cor do tipo
  const walletColor = wallet.color || typeColors[wallet.type] || DEFAULT_COLOR;

  // Debug
  console.log("WalletExtended:", wallet.name, {
    colorFromWallet: wallet.color,
    type: wallet.type,
    finalColor: walletColor,
  });

  const chartData = useMemo(() => {
    const positiveTxs = transactions
      .filter((t) => t.walletId === wallet.id && t.amount > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12);

    return positiveTxs.map((t, index) => ({
      id: t.id,
      value: t.amount,
      color: BAR_COLORS[index % BAR_COLORS.length],
    }));
  }, [transactions, wallet.id]);

  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map((d) => d.value)) * 1.2;
  }, [chartData]);

  const iconStyle = {
    backgroundColor: walletColor + "15",
    color: walletColor,
  };

  const progressStyle = {
    backgroundColor: walletColor,
    width: Math.min(percentage, 100) + "%",
  };

  return (
    <div className="card p-3 flex flex-col gap-2 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 rounded-md transition-colors" style={iconStyle}>
            <WalletIcon className="h-5 w-5" />
          </div>
          <h3 className="ml-1 text-xs font-semibold text-text-primary">
            {wallet.name}
          </h3>
        </div>
        <div className="flex items-center">
          <span
            className={cn(
              "mr-1 px-2.5 py-1 rounded text-[10px] font-medium",
              wallet.status === "active"
                ? "bg-success/10 text-success"
                : "bg-surface-elevated text-text-muted"
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
        <p className="text-xl font-bold text-text-primary tracking-tight">
          {formatCurrency(wallet.balance)}
        </p>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-text-muted">{assetsCount} Assets</p>
          <div className="shrink-0">
            <p className="text-sm font-semibold text-text-primary">
              {percentage.toFixed(2).replace(".", ",")}%
            </p>
            <p className="text-sm text-text-muted">of Portfolio</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="flex-1 h-16 min-w-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                barCategoryGap="20%"
              >
                <XAxis hide />
                <YAxis hide domain={[0, maxChartValue]} />
                <ReferenceLine
                  y={0}
                  stroke="#374151"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center">
              <div className="w-full border-t border-dashed border-border" />
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={progressStyle}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 mt-auto">
        <button
          onClick={() => onAction("deposit", wallet.id)}
          className={cn(
            "flex items-center justify-center p-2 rounded bg-surface-elevated transition-colors",
            ACTION_COLORS.add
          )}
          title="Add Funds"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("transfer", wallet.id)}
          className={cn(
            "flex items-center justify-center p-2 rounded bg-surface-elevated transition-colors",
            ACTION_COLORS.transfer
          )}
          title="Transfer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("withdraw", wallet.id)}
          className={cn(
            "flex items-center justify-center p-2 rounded bg-surface-elevated transition-colors",
            ACTION_COLORS.withdraw
          )}
          title="Withdraw"
        >
          <ArrowDownRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("adjust", wallet.id)}
          className={cn(
            "flex items-center justify-center p-2 rounded bg-surface-elevated transition-colors",
            ACTION_COLORS.adjust
          )}
          title="Adjust"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}