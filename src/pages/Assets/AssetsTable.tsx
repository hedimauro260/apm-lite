import { Fragment } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
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

export interface AssetsTableProps {
  rows: AssetRow[];
  wallets: Wallet[];
  expandedId: string | null;
  onToggleExpand: (assetId: string) => void;
  onEdit: (asset: AssetEntity) => void;
  onDelete: (asset: AssetEntity) => void;
}

function PnlValue({ pnl, pnlPercent }: { pnl: number; pnlPercent: number }) {
  const color =
    pnl > 0 ? "text-success" : pnl < 0 ? "text-danger" : "text-text-muted";
  return (
    <span className={cn("font-semibold font-mono text-xs", color)}>
      {formatCurrency(pnl)}
      <span className="ml-1 font-medium">({formatPercentage(pnlPercent)})</span>
    </span>
  );
}

export function AssetsTable({
  rows,
  wallets,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
}: AssetsTableProps) {
  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-220">
        <thead>
          <tr className="border-b border-border bg-surface-elevated">
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider w-8" />
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Asset
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Purchase
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Current Value
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Wallets
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Participation
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const isExpanded = expandedId === row.asset.id;
            return (
              <Fragment key={row.asset.id}>
                <tr
                  onClick={() => onToggleExpand(row.asset.id)}
                  className="cursor-pointer hover:bg-surface-elevated/50 transition-colors"
                >
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(row.asset.id);
                      }}
                      className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <AssetLogo asset={row.asset} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {row.asset.name}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {row.asset.symbol}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs text-text-primary font-mono">
                      {formatQuantity(row.totalQuantity)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs text-text-secondary font-mono">
                      {formatCurrency(row.purchaseValue)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs text-text-primary font-semibold font-mono">
                      {formatCurrency(row.currentValue)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs text-text-secondary">
                      {row.walletCount} wallet{row.walletCount !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(row.participation, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">
                        {row.participation.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <AssetContextMenu
                        asset={row.asset}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="bg-surface-elevated/30">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="pl-10 space-y-4">
                        {/* Average PNL */}
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                          <div className="p-2 rounded bg-primary/10 text-primary shrink-0">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              Average PNL · {row.asset.name}
                            </p>
                            <PnlValue pnl={row.pnl} pnlPercent={row.pnlPercent} />
                          </div>
                          <p className="ml-auto text-[10px] text-text-muted text-right">
                            Consolidated across {row.walletCount} wallet
                            {row.walletCount !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Per-wallet breakdown */}
                        {row.positions.length > 0 ? (
                          <div className="min-w-0 overflow-x-auto rounded-lg border border-border">
                            <table className="w-full min-w-130">
                              <thead>
                                <tr className="border-b border-border bg-surface-elevated">
                                  {["Wallet", "Quantity", "Purchase", "Current Value", "PNL"].map(
                                    (header) => (
                                      <th
                                        key={header}
                                        className="px-4 py-2 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider"
                                      >
                                        {header}
                                      </th>
                                    ),
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {row.positions.map((position) => {
                                  const currentValue =
                                    position.quantity * row.asset.currentPrice;
                                  const purchaseValue =
                                    position.quantity * position.purchasePrice;
                                  const pnl = currentValue - purchaseValue;
                                  const pnlPercent =
                                    purchaseValue > 0 ? (pnl / purchaseValue) * 100 : 0;
                                  return (
                                    <tr key={position.id} className="hover:bg-surface-elevated/40 transition-colors">
                                      <td className="px-4 py-2">
                                        <span className="text-xs font-medium text-text-primary">
                                          {walletName(position.walletId)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="text-xs text-text-secondary font-mono">
                                          {formatQuantity(position.quantity)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="text-xs text-text-secondary font-mono">
                                          {formatCurrency(purchaseValue)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="text-xs text-text-primary font-semibold font-mono">
                                          {formatCurrency(currentValue)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <PnlValue pnl={pnl} pnlPercent={pnlPercent} />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">
                            No positions in any wallet yet.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}