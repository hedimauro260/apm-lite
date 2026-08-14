import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn, formatNumber } from "../../lib/utils";
import type {
  AssetEntity,
  AssetMovementType,
  AssetPosition,
  Wallet,
} from "../../types";

export interface AssetActionData {
  assetId: string;
  walletId: string;
  actionType: AssetMovementType;
  quantity: number;
  pricePerUnit: number;
  date: string;
}

export interface AssetActionModalProps {
  open: boolean;
  assets: AssetEntity[];
  wallets: Wallet[];
  positions: AssetPosition[];
  defaultAssetId?: string;
  defaultActionType?: AssetMovementType;
  onClose: () => void;
  onSubmit: (data: AssetActionData) => void;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

const fieldClass =
  "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

export function AssetActionModal({
  open,
  assets,
  wallets,
  positions,
  defaultAssetId,
  defaultActionType = "add",
  onClose,
  onSubmit,
}: AssetActionModalProps) {
  const [assetId, setAssetId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [actionType, setActionType] = useState<AssetMovementType>("add");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const firstAsset =
      assets.find((a) => a.id === defaultAssetId) ?? assets[0];
    setAssetId(firstAsset?.id ?? "");
    setWalletId(wallets.find((w) => w.status === "active")?.id ?? wallets[0]?.id ?? "");
    setActionType(defaultActionType);
    setQuantity("");
    setPricePerUnit(firstAsset?.currentPrice ? String(firstAsset.currentPrice) : "");
    setDate(toDateInputValue(now));
    setTime(toTimeInputValue(now));
    setErrors({});
  }, [open, assets, wallets, defaultAssetId, defaultActionType]);

  const availableQuantity = useMemo(() => {
    if (!assetId || !walletId) return 0;
    return positions
      .filter((p) => p.assetId === assetId && p.walletId === walletId)
      .reduce((sum, p) => sum + p.quantity, 0);
  }, [assetId, walletId, positions]);

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!assetId) nextErrors.assetId = "Select an asset";
    if (!walletId) nextErrors.walletId = "Select a wallet";
    const parsedQuantity = parseFloat(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      nextErrors.quantity = "Enter a valid quantity greater than zero";
    } else if (actionType === "remove" && parsedQuantity > availableQuantity) {
      nextErrors.quantity = `Cannot remove more than ${formatNumber(availableQuantity)} available`;
    }
    const parsedPrice = parseFloat(pricePerUnit);
    if (pricePerUnit === "" || isNaN(parsedPrice) || parsedPrice < 0) {
      nextErrors.pricePerUnit = "Enter a valid price per unit";
    }
    if (!date) nextErrors.date = "Select a date";
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      assetId,
      walletId,
      actionType,
      quantity: parseFloat(quantity),
      pricePerUnit: parseFloat(pricePerUnit),
      date: new Date(`${date}T${time || "00:00"}`).toISOString(),
    });
  };

  const selectableWallets = wallets.filter((w) => w.status === "active");
  const walletList = selectableWallets.length > 0 ? selectableWallets : wallets;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={actionType === "add" ? "Add Asset Quantity" : "Remove Asset Quantity"}
      description="Record a change to the quantity of an asset in a wallet"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={actionType === "remove" ? "danger" : "primary"}
            onClick={handleSubmit}
          >
            {actionType === "add" ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            {actionType === "add" ? "Add" : "Remove"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Action type */}
        <div>
          <span className="block text-sm font-medium text-text-secondary">
            Action Type
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActionType("add");
                setErrors((prev) => {
                  const { quantity: _q, ...rest } = prev;
                  void _q;
                  return rest;
                });
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                actionType === "add"
                  ? "border-success bg-success/10 text-success"
                  : "border-border bg-surface text-text-secondary hover:border-border-hover",
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType("remove");
                setErrors((prev) => {
                  const { quantity: _q, ...rest } = prev;
                  void _q;
                  return rest;
                });
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                actionType === "remove"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border bg-surface text-text-secondary hover:border-border-hover",
              )}
            >
              <ArrowDownRight className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>

        {/* Asset */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Asset
          </label>
          <select
            value={assetId}
            onChange={(e) => {
              setAssetId(e.target.value);
              const asset = assets.find((a) => a.id === e.target.value);
              if (asset?.currentPrice) setPricePerUnit(String(asset.currentPrice));
              setErrors((prev) => {
                const { assetId: _a, quantity: _q, ...rest } = prev;
                void _a;
                void _q;
                return rest;
              });
            }}
            className={cn(fieldClass, "mt-1.5", errors.assetId && "border-danger focus-visible:ring-danger")}
          >
            <option value="" disabled>
              Select an asset
            </option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.symbol})
              </option>
            ))}
          </select>
          {errors.assetId && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.assetId}
            </p>
          )}
        </div>

        {/* Wallet */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">
            Wallet
          </label>
          <select
            value={walletId}
            onChange={(e) => {
              setWalletId(e.target.value);
              setErrors((prev) => {
                const { walletId: _w, quantity: _q, ...rest } = prev;
                void _w;
                void _q;
                return rest;
              });
            }}
            className={cn(fieldClass, "mt-1.5", errors.walletId && "border-danger focus-visible:ring-danger")}
          >
            <option value="" disabled>
              Select a wallet
            </option>
            {walletList.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.walletId}
            </p>
          )}
        </div>

        {/* Quantity + price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Quantity"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => {
                  const { quantity: _q, ...rest } = prev;
                  void _q;
                  return rest;
                });
              }}
              error={errors.quantity}
              helperText={
                actionType === "remove" && availableQuantity > 0
                  ? `${formatNumber(availableQuantity)} available in this wallet`
                  : undefined
              }
              required
            />
          </div>
          <Input
            label="Price per Unit (USD)"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0.00"
            value={pricePerUnit}
            onChange={(e) => {
              setPricePerUnit(e.target.value);
              setErrors((prev) => {
                const { pricePerUnit: _p, ...rest } = prev;
                void _p;
                return rest;
              });
            }}
            error={errors.pricePerUnit}
            required
          />
        </div>

        {/* Date + time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Date
            </label>
            <div className="mt-1.5 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrors((prev) => {
                    const { date: _d, ...rest } = prev;
                    void _d;
                    return rest;
                  });
                }}
                className={cn(fieldClass, "pl-10", errors.date && "border-danger focus-visible:ring-danger")}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.date}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              Time
            </label>
            <div className="mt-1.5 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(fieldClass, "pl-10")}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}