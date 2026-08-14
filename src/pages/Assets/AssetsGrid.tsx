import {
  ChevronDown,
  ChevronUp,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  cn,
  formatCurrency,
  formatPercentage,
  formatQuantity,
} from "../../lib/utils";
import type { AssetEntity, Wallet } from "../../types";
import type { AssetRow } from "./assetsLogic";
import { AssetContextMenu } from "./AssetContextMenu";
import { AssetLogo } from "./AssetLogo";

export interface AssetsGridProps {
  rows: AssetRow[];
  wallets: Wallet[];
  expandedId: string | null;
  onToggleExpand: (assetId: string) => void;
  onEdit: (asset: AssetEntity) => void;
  onDelete: (asset: AssetEntity) => void;
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className={cn("text-xs font-semibold font-mono", valueClass)}>
        {value}
      </span>
    </div>
  );
}

export function AssetsGrid({
  rows,
  wallets,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
}: AssetsGridProps) {
  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {rows.map((row) => {
        const isExpanded = expandedId === row.asset.id;
        const pnlColor =
          row.pnl > 0 ? "text-success" : row.pnl < 0 ? "text-danger" : "text-text-muted";

        return (
          <div key={row.asset.id} className="card flex flex-col h-full">
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <AssetLogo asset={row.asset} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {row.asset.name}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {row.asset.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center shrink-0">
                <AssetContextMenu
                  asset={row.asset}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
                <button
                  type="button"
                  onClick={() => onToggleExpand(row.asset.id)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="px-3 pb-3 space-y-1.5">
              <Row
                label="Quantity"
                value={`${formatQuantity(row.totalQuantity)}`}
              />
              <Row
                label="Purchase"
                value={formatCurrency(row.purchaseValue)}
              />
              <Row
                label="Current Value"
                value={formatCurrency(row.currentValue)}
              />
              <Row
                label="PNL"
                value={`${formatCurrency(row.pnl)} (${formatPercentage(row.pnlPercent)})`}
                valueClass={pnlColor}
              />
              <Row label="Wallets" value={`${row.walletCount}`} />
              <Row
                label="Participation"
                value={`${row.participation.toFixed(1)}%`}
              />
            </div>

            <div className="mt-auto border-t border-border px-3 py-2">
              <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(row.participation, 100)}%` }}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border px-3 py-3 space-y-2 bg-surface-elevated/30">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Positions by wallet
                </p>
                {row.positions.length > 0 ? (
                  row.positions.map((position) => {
                    const currentValue = position.quantity * row.asset.currentPrice;
                    const purchaseValue = position.quantity * position.purchasePrice;
                    const pnl = currentValue - purchaseValue;
                    return (
                      <div
                        key={position.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="p-1.5 rounded bg-surface-elevated text-text-secondary shrink-0">
                            <WalletIcon className="h-3 w-3" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">
                              {walletName(position.walletId)}
                            </p>
                            <p className="text-[10px] text-text-muted font-mono">
                              {formatQuantity(position.quantity)} {row.asset.symbol}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold font-mono shrink-0",
                            pnl > 0 ? "text-success" : pnl < 0 ? "text-danger" : "text-text-muted",
                          )}
                        >
                          {formatCurrency(pnl)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-text-muted">
                    No positions in any wallet yet.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}