import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import type { AssetEntity, AssetType } from "../../types";
import { AssetLogo } from "./AssetLogo";

const TYPE_OPTIONS: AssetType[] = ["crypto", "stock", "fiat", "other"];

export interface EditAssetData {
  name: string;
  symbol: string;
  type: AssetType;
}

export interface EditAssetModalProps {
  open: boolean;
  asset?: AssetEntity;
  onClose: () => void;
  onSubmit: (asset: AssetEntity, data: EditAssetData) => void;
}

export function EditAssetModal({
  open,
  asset,
  onClose,
  onSubmit,
}: EditAssetModalProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<AssetType>("crypto");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(asset?.name ?? "");
    setSymbol(asset?.symbol ?? "");
    setType(asset?.type ?? "crypto");
    setErrors({});
  }, [open, asset]);

  const handleSubmit = () => {
    if (!asset) return;
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Asset name is required";
    if (!symbol.trim()) nextErrors.symbol = "Symbol is required";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(asset, {
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      type,
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Edit Asset"
      description="Update the asset details. Historical activity is preserved."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {asset && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/40 px-4 py-3">
            <AssetLogo asset={asset} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {asset.name}
              </p>
              <p className="text-xs text-text-muted">
                {asset.symbol} · {asset.type}
              </p>
            </div>
          </div>
        )}

        <Input
          label="Asset Name"
          placeholder="e.g. Bitcoin"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => {
              const { name: _n, ...rest } = prev;
              void _n;
              return rest;
            });
          }}
          error={errors.name}
          required
        />

        <Input
          label="Symbol"
          placeholder="e.g. BTC"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value.toUpperCase());
            setErrors((prev) => {
              const { symbol: _s, ...rest } = prev;
              void _s;
              return rest;
            });
          }}
          error={errors.symbol}
          required
        />

        <div>
          <span className="block text-sm font-medium text-text-secondary">
            Type
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-all duration-150 capitalize",
                  type === option
                    ? "border-primary bg-primary/10 text-text-primary"
                    : "border-border bg-surface hover:border-border-hover text-text-secondary",
                )}
              >
                <span>{option}</span>
                {type === option && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}