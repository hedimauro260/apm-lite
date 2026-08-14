import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { formatCurrency, formatQuantity } from "../../lib/utils";
import type { AssetRow } from "./assetsLogic";
import type { Wallet } from "../../types";
import { AssetLogo } from "./AssetLogo";

export interface UpdatePricesModalProps {
  open: boolean;
  rows: AssetRow[];
  wallets: Wallet[];
  onClose: () => void;
  onSubmit: (prices: Record<string, number>) => void;
}

export function UpdatePricesModal({
  open,
  rows,
  wallets,
  onClose,
  onSubmit,
}: UpdatePricesModalProps) {
  const [prices, setPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, string> = {};
    rows.forEach((row) => {
      initial[row.asset.id] = String(row.asset.currentPrice);
    });
    setPrices(initial);
  }, [open, rows]);

  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";

  const handleSubmit = () => {
    const nextPrices: Record<string, number> = {};
    let hasInvalid = false;
    rows.forEach((row) => {
      const value = parseFloat(prices[row.asset.id]);
      if (isNaN(value) || value < 0) {
        hasInvalid = true;
        return;
      }
      nextPrices[row.asset.id] = value;
    });
    if (hasInvalid || Object.keys(nextPrices).length !== rows.length) return;
    onSubmit(nextPrices);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Update Prices"
      description="Update the current price of each asset in USD"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <RefreshCw className="h-4 w-4" />
            Update Prices
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No assets to update. Add an asset first.
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.asset.id}
              className="rounded-lg border border-border bg-surface-elevated/30 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <AssetLogo asset={row.asset} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {row.asset.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {row.asset.symbol} · {row.walletCount} wallet
                      {row.walletCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="w-36 shrink-0">
                  <span className="block text-xs font-medium text-text-secondary mb-1">
                    Current Price (USD)
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0.00"
                    size="sm"
                    value={prices[row.asset.id] ?? ""}
                    onChange={(e) =>
                      setPrices((prev) => ({
                        ...prev,
                        [row.asset.id]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Positions breakdown */}
              <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                {row.positions.length > 0 ? (
                  row.positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-text-secondary">
                        {walletName(position.walletId)}
                      </span>
                      <span className="text-text-muted">
                        {formatQuantity(position.quantity)} {row.asset.symbol}
                      </span>
                      <span className="text-text-primary font-medium font-mono">
                        {formatCurrency(position.quantity * row.asset.currentPrice)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted">
                    No positions yet in any wallet
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}