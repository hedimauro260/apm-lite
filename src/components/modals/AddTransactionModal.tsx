import { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Calendar,
    Check,
    Clock,
    Minus,
    Plus,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Switch } from "../ui/Switch";
import { cn } from "../../lib/utils";
import type { TransactionStatus, TransactionType, Wallet } from "../../types";

export type AdjustDirection = "add" | "remove";

interface TransactionTypeOption {
    value: TransactionType;
    label: string;
    subtitle: string;
    icon: typeof ArrowDownRight;
    activeClass: string;
    iconClass: string;
}

const TRANSACTION_TYPES: TransactionTypeOption[] = [
    {
        value: "deposit",
        label: "Deposit",
        subtitle: "Add funds",
        icon: ArrowDownRight,
        activeClass: "border-success bg-success/10",
        iconClass: "text-success",
    },
    {
        value: "withdraw",
        label: "Withdraw",
        subtitle: "Remove funds",
        icon: ArrowUpRight,
        activeClass: "border-danger bg-danger/10",
        iconClass: "text-danger",
    },
    {
        value: "transfer",
        label: "Transfer",
        subtitle: "Move between wallets",
        icon: ArrowLeftRight,
        activeClass: "border-primary bg-primary/10",
        iconClass: "text-primary",
    },
    {
        value: "adjust",
        label: "Adjust",
        subtitle: "Correct balance",
        icon: AlertCircle,
        activeClass: "border-warning bg-warning/10",
        iconClass: "text-warning",
    },
];

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
];

export interface AddTransactionData {
    type: TransactionType;
    walletId: string;
    relatedWalletId?: string;
    amount: number;
    direction?: AdjustDirection;
    status: TransactionStatus;
    date: string;
    description?: string;
    website?: string;
    countsTowardsGoals?: boolean;
}

export interface AddTransactionModalProps {
    open: boolean;
    wallets: Wallet[];
    defaultType?: TransactionType;
    defaultWalletId?: string;
    onClose: () => void;
    onSubmit: (data: AddTransactionData) => void;
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

export function AddTransactionModal({
    open,
    wallets,
    defaultType = "deposit",
    defaultWalletId,
    onClose,
    onSubmit,
}: AddTransactionModalProps) {
    const [type, setType] = useState<TransactionType>("deposit");
    const [walletId, setWalletId] = useState("");
    const [toWalletId, setToWalletId] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState<AdjustDirection>("add");
    const [status, setStatus] = useState<TransactionStatus>("completed");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");
    const [countsTowardsGoals, setCountsTowardsGoals] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;
        const now = new Date();
        const firstWallet =
            wallets.find((w) => w.id === defaultWalletId) ??
            wallets.find((w) => w.status === "active") ??
            wallets[0];

        setType(defaultType);
        setWalletId(firstWallet?.id ?? "");
        setToWalletId("");
        setAmount("");
        setDirection("add");
        setStatus("completed");
        setDate(toDateInputValue(now));
        setTime(toTimeInputValue(now));
        setDescription("");
        setWebsite("");
        setCountsTowardsGoals(true);
        setErrors({});
    }, [open, defaultType, defaultWalletId, wallets]);

    const isTransfer = type === "transfer";
    const isAdjust = type === "adjust";

    const selectableWallets = wallets.filter((w) => w.status === "active");
    const walletList = selectableWallets.length > 0 ? selectableWallets : wallets;

    const handleTypeChange = (nextType: TransactionType) => {
        setType(nextType);
        if (nextType !== "transfer") setToWalletId("");
        setErrors((prev) => {
            const { walletId: _w, toWalletId: _t, amount: _a, type: _ty, ...rest } = prev;
            void _w;
            void _t;
            void _a;
            void _ty;
            return rest;
        });
    };

    const validate = (): Record<string, string> => {
        const nextErrors: Record<string, string> = {};
        if (!walletId) nextErrors.walletId = "Select a wallet";
        if (isTransfer) {
            if (!toWalletId) nextErrors.toWalletId = "Select the destination wallet";
            else if (toWalletId === walletId)
                nextErrors.toWalletId = "Must be different from the source wallet";
        }
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            nextErrors.amount = "Enter a valid amount greater than zero";
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

        const isoDate = new Date(`${date}T${time || "00:00"}`).toISOString();
        onSubmit({
            type,
            walletId,
            relatedWalletId: isTransfer ? toWalletId : undefined,
            amount: parseFloat(amount),
            direction: isAdjust ? direction : undefined,
            status,
            date: isoDate,
            description: description.trim() || undefined,
            website: website.trim() || undefined,
            countsTowardsGoals: type === "deposit" ? countsTowardsGoals : undefined,
        });
    };

    const typeFieldClass =
        "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Add Transaction"
            description="Create a new transaction for your wallet"
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {/* Tipo de transação */}
                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Transaction Type
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {TRANSACTION_TYPES.map((option) => {
                            const Icon = option.icon;
                            const isActive = type === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTypeChange(option.value)}
                                    className={cn(
                                        "flex items-center md:flex-col md:justify-center gap-2 rounded-md border px-3 py-2 text-left transition-all duration-150",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                        isActive
                                            ? option.activeClass
                                            : "border-border bg-surface hover:border-border-hover"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "p-1.5 rounded shrink-0",
                                            isActive ? option.iconClass : "text-text-muted"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span
                                            className={cn(
                                                "block text-center text-sm font-medium",
                                                isActive ? "text-text-primary" : "text-text-secondary"
                                            )}
                                        >
                                            {option.label}
                                        </span>
                                        <span className="block text-center text-[10px] text-text-muted">
                                            {option.subtitle}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Carteiras */}
                <div className={cn("grid gap-4", isTransfer ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            {isTransfer ? "From Wallet" : "Wallet"}
                        </label>
                        <select
                            value={walletId}
                            onChange={(e) => {
                                setWalletId(e.target.value);
                                setErrors((prev) => {
                                    const { walletId: _w, toWalletId: _t, ...rest } = prev;
                                    void _w;
                                    void _t;
                                    return rest;
                                });
                                if (e.target.value === toWalletId) setToWalletId("");
                            }}
                            className={cn(typeFieldClass, "mt-1.5", errors.walletId && "border-danger focus-visible:ring-danger")}
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

                    {isTransfer && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                To Wallet
                            </label>
                            <select
                                value={toWalletId}
                                onChange={(e) => {
                                    setToWalletId(e.target.value);
                                    setErrors((prev) => {
                                        const { toWalletId: _t, ...rest } = prev;
                                        void _t;
                                        return rest;
                                    });
                                }}
                                className={cn(typeFieldClass, "mt-1.5", errors.toWalletId && "border-danger focus-visible:ring-danger")}
                            >
                                <option value="" disabled>
                                    Select a wallet
                                </option>
                                {walletList.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id} disabled={wallet.id === walletId}>
                                        {wallet.name}
                                    </option>
                                ))}
                            </select>
                            {errors.toWalletId && (
                                <p className="mt-1 text-sm text-danger" role="alert">
                                    {errors.toWalletId}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Direção do ajuste */}
                {isAdjust && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Adjustment Direction
                        </label>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setDirection("add")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                                    direction === "add"
                                        ? "border-success bg-success/10 text-success"
                                        : "border-border bg-surface text-text-secondary hover:border-border-hover"
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setDirection("remove")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                                    direction === "remove"
                                        ? "border-danger bg-danger/10 text-danger"
                                        : "border-border bg-surface text-text-secondary hover:border-border-hover"
                                )}
                            >
                                <Minus className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* Valor */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Amount <span className="text-text-muted">(USD)</span>
                    </label>
                    <Input
                        className="mt-1.5"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setErrors((prev) => {
                                const { amount: _a, ...rest } = prev;
                                void _a;
                                return rest;
                            });
                        }}
                        error={errors.amount}
                    />
                </div>

                {/* Contabilização para Goals (apenas depósito) */}
                {type === "deposit" && (
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-elevated/40 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary">
                                Count towards goals
                            </p>
                            <p className="text-xs text-text-muted">
                                Include this deposit when calculating weekly goals
                            </p>
                        </div>
                        <Switch
                            checked={countsTowardsGoals}
                            onChange={setCountsTowardsGoals}
                        />
                    </div>
                )}

                {/* Data e hora */}
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
                                className={cn(
                                    typeFieldClass,
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
                                className={cn(typeFieldClass, "pl-10")}
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Status
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((option) => {
                            const isActive = status === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                        isActive
                                            ? "border-primary bg-primary/10 text-text-primary"
                                            : "border-border bg-surface text-text-secondary hover:border-border-hover"
                                    )}
                                >
                                    {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Website (apenas depósito e retirada) */}
                {(type === "deposit" || type === "withdraw") && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Website <span className="text-text-muted">(optional)</span>
                        </label>
                        <Input
                            className="mt-1.5"
                            placeholder="e.g. Binance, Wise, Bank App"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>
                )}

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Description <span className="text-text-muted">(optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Salary deposit, exchange withdrawal..."
                        rows={2}
                        className="mt-1.5 w-full rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-2 text-base transition-all duration-150 hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                </div>
            </div>
        </Modal>
    );
}