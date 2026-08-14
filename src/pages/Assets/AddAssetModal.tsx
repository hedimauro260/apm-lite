import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Coins,
  Plus,
  Search,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import { PRESET_ASSETS } from "../../data/assetsList";
import { generateId } from "../../lib/utils";
import type { AssetEntity, Wallet } from "../../types";
import { AssetLogo } from "./AssetLogo";

export interface AddAssetData {
  asset: AssetEntity;
  walletId: string;
  initialQuantity: number;
  purchasePrice: number;
  date: string;
}

export interface AddAssetModalProps {
  open: boolean;
  wallets: Wallet[];
  existingAssets: AssetEntity[];
  onClose: () => void;
  onSubmit: (data: AddAssetData) => void;
}

type AssetTypeOption = "crypto" | "fiat";

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

export function AddAssetModal({
  open,
  wallets,
  existingAssets,
  onClose,
  onSubmit,
}: AddAssetModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<AssetEntity | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customType, setCustomType] = useState<AssetTypeOption>("crypto");
  const [walletId, setWalletId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setStep(1);
    setSearch("");
    setSelectedAsset(null);
    setIsCustomMode(false);
    setCustomName("");
    setCustomSymbol("");
    setCustomType("crypto");
    setWalletId(wallets.find((w) => w.status === "active")?.id ?? wallets[0]?.id ?? "");
    setQuantity("");
    setPurchasePrice("");
    setDate(toDateInputValue(now));
    setTime(toTimeInputValue(now));
    setErrors({});
  }, [open, wallets]);

  const availableAssets = useMemo(() => {
    const presets: AssetEntity[] = PRESET_ASSETS.map((preset) => ({
      id: preset.id,
      name: preset.name,
      symbol: preset.symbol,
      type: preset.type,
      currentPrice: 0,
      logo: preset.logo,
      color: preset.defaultColor,
      isCustom: false,
      createdAt: "",
      updatedAt: "",
    }));
    const merged = [...presets];
    existingAssets.forEach((asset) => {
      if (!merged.some((item) => item.symbol === asset.symbol)) {
        merged.push(asset);
      }
    });

    const query = search.trim().toLowerCase();
    if (!query) return merged;
    return merged.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.symbol.toLowerCase().includes(query),
    );
  }, [search, existingAssets]);

  const customAsset: AssetEntity | null =
    isCustomMode && customName.trim() && customSymbol.trim()
      ? {
          id: `asset-${generateId()}`,
          name: customName.trim(),
          symbol: customSymbol.trim().toUpperCase(),
          type: customType,
          currentPrice: 0,
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : null;

  const currentAsset = selectedAsset ?? customAsset;

  const validateStep1 = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!currentAsset) nextErrors.asset = "Select or create an asset";
    if (isCustomMode && !customName.trim()) nextErrors.customName = "Asset name is required";
    if (isCustomMode && !customSymbol.trim()) nextErrors.customSymbol = "Symbol is required";
    return nextErrors;
  };

  const validateStep2 = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!walletId) nextErrors.walletId = "Select a wallet";
    const parsedQuantity = parseFloat(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      nextErrors.quantity = "Enter a valid quantity greater than zero";
    }
    const parsedPrice = parseFloat(purchasePrice);
    if (purchasePrice === "" || isNaN(parsedPrice) || parsedPrice < 0) {
      nextErrors.purchasePrice = "Enter a valid purchase price";
    }
    if (!date) nextErrors.date = "Select a date";
    return nextErrors;
  };

  const handleNext = () => {
    const nextErrors = validateStep1();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleBack = () => {
    setErrors({});
    setStep(1);
  };

  const handleSubmit = () => {
    if (!currentAsset) return;
    const nextErrors = validateStep2();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      asset: currentAsset,
      walletId,
      initialQuantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      date: new Date(`${date}T${time || "00:00"}`).toISOString(),
    });
  };

  const selectableWallets = wallets.filter((w) => w.status === "active");
  const walletList = selectableWallets.length > 0 ? selectableWallets : wallets;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Add Asset"
      description="Create a new asset position in an existing wallet"
      size="lg"
      footer={
        <>
          {step === 2 && (
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit}>
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step === s
                    ? "bg-primary text-white"
                    : step > s
                      ? "bg-success/10 text-success"
                      : "bg-surface-elevated text-text-muted",
                )}
              >
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  step >= s ? "text-text-primary" : "text-text-muted",
                )}
              >
                {s === 1 ? "Select or Create Asset" : "Initial Position"}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            {/* Custom asset toggle */}
            <button
              type="button"
              onClick={() => {
                setIsCustomMode((value) => !value);
                setErrors((prev) => {
                  const { asset: _a, customName: _n, customSymbol: _s, ...rest } = prev;
                  void _a;
                  void _n;
                  void _s;
                  return rest;
                });
              }}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isCustomMode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-text-secondary hover:border-border-hover",
              )}
            >
              <Plus className="h-4 w-4" />
              Create Custom Asset
            </button>

            {isCustomMode ? (
              <div className="space-y-4 rounded-lg border border-border bg-surface-elevated/40 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Asset Name"
                    placeholder="e.g. My Token"
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      setErrors((prev) => {
                        const { customName: _n, ...rest } = prev;
                        void _n;
                        return rest;
                      });
                    }}
                    error={errors.customName}
                    required
                  />
                  <Input
                    label="Symbol"
                    placeholder="e.g. MTK"
                    value={customSymbol}
                    onChange={(e) => {
                      setCustomSymbol(e.target.value.toUpperCase());
                      setErrors((prev) => {
                        const { customSymbol: _s, ...rest } = prev;
                        void _s;
                        return rest;
                      });
                    }}
                    error={errors.customSymbol}
                    required
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-text-secondary">
                    Type
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["crypto", "fiat"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCustomType(option)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-all duration-150 capitalize",
                          customType === option
                            ? "border-primary bg-primary/10 text-text-primary"
                            : "border-border bg-surface hover:border-border-hover text-text-secondary",
                        )}
                      >
                        <span>{option}</span>
                        {customType === option && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-text-secondary">
                    Select Asset
                  </span>
                  <span className="text-xs text-text-muted">
                    {availableAssets.length} available
                  </span>
                </div>
                <Input
                  className="mt-1.5"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  iconLeft={<Search className="h-4 w-4" />}
                />
                <div className="mt-2 max-h-56 overflow-y-auto custom-scrollbar border border-border rounded-md">
                  {availableAssets.length > 0 ? (
                    availableAssets.map((asset) => {
                      const isSelected =
                        selectedAsset?.id === asset.id ||
                        (!isCustomMode && selectedAsset?.id === asset.id);
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setErrors((prev) => {
                              const { asset: _a, ...rest } = prev;
                              void _a;
                              return rest;
                            });
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 border-b border-border/50 text-left transition-colors last:border-b-0",
                            isSelected ? "bg-primary/10" : "hover:bg-surface",
                          )}
                        >
                          <AssetLogo asset={asset} size="sm" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-text-primary truncate">
                              {asset.name}
                            </span>
                            <span className="block text-xs text-text-muted">
                              {asset.symbol} · {asset.type}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-border",
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-text-muted">
                      <Coins className="h-6 w-6" />
                      <span className="text-sm">No assets found</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {errors.asset && (
              <p className="text-sm text-danger" role="alert">
                {errors.asset}
              </p>
            )}
          </>
        )}

        {step === 2 && currentAsset && (
          <>
            {/* Selected asset summary */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/40 px-4 py-3">
              <AssetLogo asset={currentAsset} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {currentAsset.name}
                </p>
                <p className="text-xs text-text-muted">
                  {currentAsset.symbol} · {currentAsset.type}
                  {currentAsset.isCustom && " · Custom"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Wallet
              </label>
              <select
                value={walletId}
                onChange={(e) => {
                  setWalletId(e.target.value);
                  setErrors((prev) => {
                    const { walletId: _w, ...rest } = prev;
                    void _w;
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Initial Quantity"
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
                required
              />
              <Input
                label="Purchase Price (USD)"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value);
                  setErrors((prev) => {
                    const { purchasePrice: _p, ...rest } = prev;
                    void _p;
                    return rest;
                  });
                }}
                error={errors.purchasePrice}
                required
              />
            </div>

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
          </>
        )}
      </div>
    </Modal>
  );
}