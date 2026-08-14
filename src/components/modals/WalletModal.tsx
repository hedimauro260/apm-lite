import { useEffect, useMemo, useState } from "react";
import { Check, Coins, Search } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn } from "../../lib/utils";
import { PRESET_ASSETS } from "../../data/assetsList";
import type { Wallet, WalletType } from "../../types";

export const WALLET_TYPES: { value: WalletType; label: string }[] = [
    { value: "exchange", label: "Exchange" },
    { value: "hot", label: "Crypto Wallet" },
    { value: "micro", label: "Micro Wallet" },
    { value: "bank", label: "Bank" },
    { value: "other", label: "Other" },
];

export const COLOR_OPTIONS = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#EF4444", // Red
    "#6B7280", // Gray
];

export interface WalletModalData {
    name: string;
    type: WalletType;
    assetIds: string[];
    description?: string;
    color: string;
}

export interface WalletModalProps {
    open: boolean;
    mode: "create" | "edit";
    wallet?: Wallet;
    onClose: () => void;
    onSubmit?: (data: WalletModalData) => void;
    onUpdate?: (wallet: Wallet, data: WalletModalData) => void;
}

export function WalletModal({
    open,
    mode = "create",
    wallet,
    onClose,
    onSubmit,
    onUpdate,
}: WalletModalProps) {
    const isEditing = mode === "edit";

    const [name, setName] = useState("");
    const [type, setType] = useState<WalletType>("exchange");
    const [assetIds, setAssetIds] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLOR_OPTIONS[0]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        if (isEditing && wallet) {
            setName(wallet.name);
            setType(wallet.type);
            setAssetIds([]);
            setDescription(wallet.description ?? "");
            setColor(wallet.color || COLOR_OPTIONS[0]);
        } else {
            setName("");
            setType("exchange");
            setAssetIds([]);
            setDescription("");
            setColor(COLOR_OPTIONS[0]);
        }
        setSearch("");
        setError("");
    }, [open, isEditing, wallet]);

    const filteredAssets = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return PRESET_ASSETS;
        return PRESET_ASSETS.filter(
            (asset) =>
                asset.name.toLowerCase().includes(query) ||
                asset.symbol.toLowerCase().includes(query)
        );
    }, [search]);

    const toggleAsset = (id: string) => {
        setAssetIds((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Wallet name is required");
            return;
        }
        const data: WalletModalData = {
            name: name.trim(),
            type,
            assetIds,
            description: description.trim() || undefined,
            color,
        };
        if (isEditing && wallet) {
            onUpdate?.(wallet, data);
        } else {
            onSubmit?.(data);
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={isEditing ? "Edit Wallet" : "Add Wallet"}
            description={
                isEditing
                    ? "Update your wallet information"
                    : "Create a new wallet for your portfolio"
            }
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? "Save Changes" : "Create Wallet"}
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                <Input
                    label="Wallet Name"
                    placeholder="e.g. Binance"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    error={error}
                    required
                />

                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Wallet Type
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {WALLET_TYPES.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setType(option.value)}
                                className={cn(
                                    "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-all duration-150",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    type === option.value
                                        ? "border-primary bg-primary/10 text-text-primary"
                                        : "border-border bg-surface hover:border-border-hover text-text-secondary"
                                )}
                            >
                                <span>{option.label}</span>
                                {type === option.value && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium text-text-secondary">
                            Assets
                        </span>
                        <span
                            className={cn(
                                "text-sm font-medium",
                                assetIds.length > 0 ? "text-primary" : "text-text-muted"
                            )}
                        >
                            {assetIds.length} selected
                        </span>
                    </div>

                    <Input
                        className="mt-1.5"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        iconLeft={<Search className="h-4 w-4" />}
                    />

                    <div className="mt-2 max-h-52 overflow-y-auto custom-scrollbar border border-border rounded-md">
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map((asset) => {
                                const isSelected = assetIds.includes(asset.id);
                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => toggleAsset(asset.id)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-3 py-2 border-b border-border/50 text-left transition-colors last:border-b-0",
                                            isSelected
                                                ? "bg-primary/10"
                                                : "hover:bg-surface"
                                        )}
                                    >
                                        <img
                                            src={asset.logo}
                                            alt={asset.name}
                                            className="h-7 w-7 rounded-full shrink-0 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
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
                                                    : "border-border"
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

                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Description{" "}
                        <span className="text-text-muted">(optional)</span>
                    </span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Main exchange wallet"
                        rows={2}
                        className="mt-1.5 w-full rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-2 text-base transition-all duration-150 hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                </div>

                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Wallet Color
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setColor(option)}
                                aria-label={`Select color ${option}`}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all duration-150",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    color === option ? "scale-110" : "hover:scale-110"
                                )}
                                style={{
                                    backgroundColor: option,
                                    boxShadow:
                                        color === option
                                            ? `0 0 0 2px var(--color-background), 0 0 0 4px ${option}`
                                            : undefined,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}