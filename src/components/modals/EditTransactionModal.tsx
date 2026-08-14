import { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Calendar,
    Check,
    Clock,
    Save,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Switch } from "../ui/Switch";
import { cn } from "../../lib/utils";
import type {
    Transaction,
    TransactionStatus,
    TransactionType,
    Wallet,
} from "../../types";

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
];

const TYPE_CONFIG: Record<
    TransactionType,
    { label: string; icon: typeof ArrowDownRight; iconClass: string; badgeClass: string }
> = {
    deposit: {
        label: "Deposit",
        icon: ArrowDownRight,
        iconClass: "text-success",
        badgeClass: "bg-success/10 text-success",
    },
    withdraw: {
        label: "Withdraw",
        icon: ArrowUpRight,
        iconClass: "text-danger",
        badgeClass: "bg-danger/10 text-danger",
    },
    transfer: {
        label: "Transfer",
        icon: ArrowLeftRight,
        iconClass: "text-primary",
        badgeClass: "bg-primary/10 text-primary",
    },
    adjust: {
        label: "Adjust",
        icon: AlertCircle,
        iconClass: "text-warning",
        badgeClass: "bg-warning/10 text-warning",
    },
};

export interface EditTransactionData {
    amount: number;
    status: TransactionStatus;
    date: string;
    description?: string;
    website?: string;
    countsTowardsGoals?: boolean;
}

export interface EditTransactionModalProps {
    open: boolean;
    transaction?: Transaction;
    wallets: Wallet[];
    onClose: () => void;
    onSubmit: (transaction: Transaction, data: EditTransactionData) => void;
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

export function EditTransactionModal({
    open,
    transaction,
    wallets,
    onClose,
    onSubmit,
}: EditTransactionModalProps) {
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<TransactionStatus>("completed");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [countsTowardsGoals, setCountsTowardsGoals] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open || !transaction) return;
        const txDate = new Date(transaction.date);
        setAmount(String(Math.abs(transaction.amount)));
        setStatus(transaction.status);
        setDate(toDateInputValue(txDate));
        setTime(toTimeInputValue(txDate));
        setWebsite(transaction.website ?? "");
        setDescription(transaction.description ?? "");
        setCountsTowardsGoals(transaction.countsTowardsGoals ?? true);
        setErrors({});
    }, [open, transaction]);

    const wallet = wallets.find((w) => w.id === transaction?.walletId);
    const config = transaction ? TYPE_CONFIG[transaction.type] : undefined;
    const showWebsite =
        transaction?.type === "deposit" || transaction?.type === "withdraw";
    const originalNegative = (transaction?.amount ?? 0) < 0;

    const validate = (): Record<string, string> => {
        const nextErrors: Record<string, string> = {};
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            nextErrors.amount = "Enter a valid amount greater than zero";
        }
        if (!date) nextErrors.date = "Select a date";
        return nextErrors;
    };

    const handleSubmit = () => {
        if (!transaction) return;
        const nextErrors = validate();
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const isoDate = new Date(`${date}T${time || "00:00"}`).toISOString();
        const sign = originalNegative ? -1 : 1;
        onSubmit(transaction, {
            amount: parseFloat(amount) * sign,
            status,
            date: isoDate,
            description: description.trim() || undefined,
            website: website.trim() || undefined,
            countsTowardsGoals:
                transaction.type === "deposit" ? countsTowardsGoals : undefined,
        });
    };

    const typeFieldClass =
        "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Edit Transaction"
            description="Update the details of this transaction"
            size="lg"
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
                {/* Cabeçalho com carteira e tipo (não editáveis) */}
                {transaction && config && (
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-elevated border border-border px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className={cn("p-2 rounded-md shrink-0", config.iconClass, "bg-surface")}
                            >
                                <config.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {wallet?.name ?? "Unknown Wallet"}
                                </p>
                                <p className="text-xs text-text-muted">
                                    Wallet · not editable
                                </p>
                            </div>
                        </div>
                        <span
                            className={cn(
                                "px-2.5 py-1 rounded text-xs font-medium capitalize shrink-0",
                                config.badgeClass
                            )}
                        >
                            {config.label}
                        </span>
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
                {transaction?.type === "deposit" && (
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

                {/* Website (apenas depósito e retirada) */}
                {showWebsite && (
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