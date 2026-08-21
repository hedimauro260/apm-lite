import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Calendar,
    Clock,
    Info,
    Plus,
    Save,
    Wallet as WalletIcon,
} from "lucide-react";
import { evaluate } from "mathjs";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn, formatCurrency } from "../../lib/utils";
import type { Site, SiteMovement, SiteMovementType, Wallet } from "../../types";

export interface SiteMovementModalData {
    siteId: string;
    type: SiteMovementType;
    amount: number;
    walletId?: string;
    date: string;
    description?: string;
}

export interface SiteMovementModalProps {
    open: boolean;
    mode: "create" | "edit";
    movement?: SiteMovement;
    sites: Site[];
    wallets: Wallet[];
    defaultType?: SiteMovementType;
    defaultSiteId?: string;
    onClose: () => void;
    onSubmit?: (data: SiteMovementModalData) => void;
    onUpdate?: (movement: SiteMovement, data: SiteMovementModalData) => void;
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

function tryEvaluateExpression(expr: string): number | null {
    const trimmed = expr.trim();
    if (!trimmed) return null;
    if (!/[+\-*/()%]/.test(trimmed)) return null;
    if (/[^0-9+\-*/().\s%]/.test(trimmed)) return null;
    try {
        const result = evaluate(trimmed);
        if (typeof result !== "number" || !isFinite(result)) return null;
        return Number(result.toFixed(2));
    } catch {
        return null;
    }
}

export function SiteMovementModal({
    open,
    mode = "create",
    movement,
    sites,
    wallets,
    defaultType = "earn",
    defaultSiteId,
    onClose,
    onSubmit,
    onUpdate,
}: SiteMovementModalProps) {
    const isEditing = mode === "edit";

    const [type, setType] = useState<SiteMovementType>("earn");
    const [siteId, setSiteId] = useState("");
    const [amount, setAmount] = useState("");
    const [walletId, setWalletId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedSite = useMemo(
        () => sites.find((s) => s.id === siteId) ?? null,
        [sites, siteId]
    );
    const currentBalance = selectedSite?.balance ?? 0;

    const handleEvaluateAmount = () => {
        const result = tryEvaluateExpression(amount);
        if (result !== null && isFinite(result)) {
            setAmount(String(result));
            setErrors((p) => {
                const { amount: _a, ...rest } = p;
                void _a;
                return rest;
            });
            return true;
        }
        if (/[+\-*/()%]/.test(amount)) {
            setErrors((p) => ({ ...p, amount: "Invalid expression" }));
        }
        return false;
    };

    const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "=") {
            const hasOperator = /[+\-*/()%]/.test(amount);
            if (hasOperator) {
                e.preventDefault();
                handleEvaluateAmount();
            } else if (e.key === "=") {
                e.preventDefault();
            }
        }
    };

    useEffect(() => {
        if (!open) return;
        const now = new Date();

        const firstSite =
            sites.find((s) => s.id === defaultSiteId) ??
            sites.find((s) => s.status === "active") ??
            sites[0];

        if (isEditing && movement) {
            setType(movement.type);
            setSiteId(movement.siteId);
            setAmount(String(movement.amount));
            setWalletId(movement.walletId ?? "");
            setDate(toDateInputValue(new Date(movement.date)));
            setTime(toTimeInputValue(new Date(movement.date)));
            setDescription(movement.description ?? "");
        } else {
            setType(defaultType);
            setSiteId(firstSite?.id ?? "");
            setAmount("");
            setWalletId("");
            setDate(toDateInputValue(now));
            setTime(toTimeInputValue(now));
            setDescription("");
        }
        setErrors({});
    }, [open, isEditing, movement, sites, defaultType, defaultSiteId]);

    const handleSubmit = () => {
        const nextErrors: Record<string, string> = {};
        if (!siteId) nextErrors.siteId = "Select a site";
        let amountToParse = amount.trim();
        const evaluated = tryEvaluateExpression(amountToParse);
        if (evaluated !== null) {
            amountToParse = String(evaluated);
            if (amount !== amountToParse) setAmount(amountToParse);
        } else if (/[+\-*/()%]/.test(amountToParse)) {
            nextErrors.amount = "Invalid expression";
        }
        const parsedAmount = parseFloat(amountToParse);
        if (!amountToParse || isNaN(parsedAmount) || parsedAmount <= 0 || !isFinite(parsedAmount)) {
            if (!nextErrors.amount) nextErrors.amount = "Enter a valid amount greater than zero";
        }
        if (!date) nextErrors.date = "Select a date";
        if (type === "withdraw" && walletId && !wallets.some((w) => w.id === walletId)) {
            nextErrors.walletId = "Invalid wallet";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const isoDate = new Date(`${date}T${time || "00:00"}`).toISOString();
        const data: SiteMovementModalData = {
            siteId,
            type,
            amount: parsedAmount,
            walletId: type === "withdraw" ? walletId || undefined : undefined,
            date: isoDate,
            description: description.trim() || undefined,
        };

        if (isEditing && movement) {
            onUpdate?.(movement, data);
        } else {
            onSubmit?.(data);
        }
    };

    const fieldClass =
        "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

    const activeSites = sites.filter((s) => s.status === "active");
    const siteList = activeSites.length > 0 ? activeSites : sites;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={isEditing ? "Edit Movement" : "Add Earning / Withdrawal"}
            description={
                isEditing
                    ? "Update the record"
                    : "Record a daily earning or a withdrawal from the platform"
            }
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Record type
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setType("earn");
                                setErrors((p) => {
                                    const { walletId: _w, ...rest } = p;
                                    void _w;
                                    return rest;
                                });
                            }}
                            className={cn(
                                "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-all duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                type === "earn"
                                    ? "border-success bg-success/10"
                                    : "border-border bg-surface hover:border-border-hover"
                            )}
                        >
                            <span
                                className={cn(
                                    "p-1.5 rounded shrink-0",
                                    type === "earn" ? "text-success" : "text-text-muted"
                                )}
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        "block text-sm font-medium",
                                        type === "earn" ? "text-text-primary" : "text-text-secondary"
                                    )}
                                >
                                    Earning
                                </span>
                                <span className="block text-[10px] text-text-muted">
                                    Money that came in
                                </span>
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("withdraw")}
                            className={cn(
                                "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-all duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                type === "withdraw"
                                    ? "border-danger bg-danger/10"
                                    : "border-border bg-surface hover:border-border-hover"
                            )}
                        >
                            <span
                                className={cn(
                                    "p-1.5 rounded shrink-0",
                                    type === "withdraw" ? "text-danger" : "text-text-muted"
                                )}
                            >
                                <ArrowUpFromLine className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        "block text-sm font-medium",
                                        type === "withdraw" ? "text-text-primary" : "text-text-secondary"
                                    )}
                                >
                                    Withdrawal
                                </span>
                                <span className="block text-[10px] text-text-muted">
                                    Money that went out
                                </span>
                            </span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Site
                    </label>
                    <select
                        value={siteId}
                        onChange={(e) => {
                            setSiteId(e.target.value);
                            setErrors((p) => {
                                const { siteId: _s, ...rest } = p;
                                void _s;
                                return rest;
                            });
                        }}
                        className={cn(
                            fieldClass,
                            "mt-1.5",
                            errors.siteId && "border-danger focus-visible:ring-danger"
                        )}
                    >
                        <option value="" disabled>
                            Select a site
                        </option>
                        {siteList.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.name}
                            </option>
                        ))}
                    </select>
                    {errors.siteId && (
                        <p className="mt-1 text-sm text-danger" role="alert">
                            {errors.siteId}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Amount <span className="text-text-muted">(USD)</span>
                    </label>
                    <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="flex-1 min-w-0">
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00 or e.g. 100 + 50"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors((p) => {
                                        const { amount: _a, ...rest } = p;
                                        void _a;
                                        return rest;
                                    });
                                }}
                                onKeyDown={handleAmountKeyDown}
                                error={errors.amount}
                            />
                            <p className="mt-1 text-xs text-text-muted">
                                Tip: type an expression like <span className="font-mono">100 + 50</span> and press <span className="font-mono">Enter</span> or <span className="font-mono">=</span> to calculate
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-elevated/40 px-3 py-2 sm:h-10 sm:shrink-0 sm:justify-start">
                            <span className="text-xs text-text-muted whitespace-nowrap">Current Balance:</span>
                            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                                {formatCurrency(currentBalance)}
                            </span>
                        </div>
                    </div>
                </div>

                {type === "withdraw" && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Destination wallet{" "}
                            <span className="text-text-muted">(optional)</span>
                        </label>
                        <div className="mt-1.5 relative">
                            <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                            <select
                                value={walletId}
                                onChange={(e) => setWalletId(e.target.value)}
                                className={cn(fieldClass, "pl-10 appearance-none")}
                            >
                                <option value="">Select a wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {wallet.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-surface-elevated/40 px-3 py-2.5">
                            <Info className="h-4 w-4 shrink-0 mt-0.5 text-info" />
                            <p className="text-xs text-text-muted">
                                The selected wallet is for reference only. The withdrawn amount is not
                                added to its balance.
                            </p>
                        </div>
                        {wallets.length === 0 && (
                            <p className="mt-1 text-xs text-text-muted">
                                No wallets registered yet. You can create one on the Wallets tab.
                            </p>
                        )}
                        {errors.walletId && (
                            <p className="mt-1 text-sm text-danger" role="alert">
                                {errors.walletId}
                            </p>
                        )}
                    </div>
                )}

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
                                    setErrors((p) => {
                                        const { date: _d, ...rest } = p;
                                        void _d;
                                        return rest;
                                    });
                                }}
                                className={cn(
                                    fieldClass,
                                    "pl-10",
                                    errors.date && "border-danger focus-visible:ring-danger"
                                )}
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

                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Description{" "}
                        <span className="text-text-muted">(optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Daily surveys earning, withdrawal to wallet..."
                        rows={2}
                        className="mt-1.5 w-full rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-2 text-base transition-all duration-150 hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                </div>
            </div>
        </Modal>
    );
}
