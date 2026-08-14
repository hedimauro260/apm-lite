import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Save,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import type { AssetMovement, Wallet } from "../../types";

export interface EditActivityData {
  quantity: number;
  price: number;
  walletId: string;
  date: string;
}

export interface EditActivityModalProps {
  open: boolean;
  movement?: AssetMovement;
  wallets: Wallet[];
  onClose: () => void;
  onSubmit: (movement: AssetMovement, data: EditActivityData) => void;
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

export function EditActivityModal({
  open,
  movement,
  wallets,
  onClose,
  onSubmit,
}: EditActivityModalProps) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [walletId, setWalletId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setQuantity(movement ? String(movement.quantity) : "");
    setPrice(movement ? String(movement.priceAtAction) : "");
    setWalletId(movement?.walletId ?? "");
    setDate(movement ? toDateInputValue(new Date(movement.date)) : "");
    setTime(movement ? toTimeInputValue(new Date(movement.date)) : "");
    setErrors({});
  }, [open, movement]);

  const selectableWallets = wallets.filter((w) => w.status === "active");
  const walletList = selectableWallets.length > 0 ? selectableWallets : wallets;

  const handleSubmit = () => {
    if (!movement) return;
    const nextErrors: Record<string, string> = {};
    const parsedQuantity = parseFloat(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      nextErrors.quantity = "Enter a valid quantity greater than zero";
    }
    const parsedPrice = parseFloat(price);
    if (price === "" || isNaN(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = "Enter a valid price per unit";
    }
    if (!walletId) nextErrors.walletId = "Select a wallet";
    if (!date) nextErrors.date = "Select a date";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(movement, {
      quantity: parsedQuantity,
      price: parsedPrice,
      walletId,
      date: new Date(`${date}T${time || "00:00"}`).toISOString(),
    });
  };

  const isAdd = movement?.actionType === "add";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Edit Activity"
      description="Update the details of this registered activity."
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
        {movement && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/40 px-4 py-3">
            <span
              className={cn(
                "p-1.5 rounded shrink-0",
                isAdd
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger",
              )}
            >
              {isAdd ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {movement.assetName}
              </p>
              <p className="text-xs text-text-muted">
                {movement.assetSymbol} · {movement.actionType}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0.00000000"
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
            label="Price per Unit (USD)"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((prev) => {
                const { price: _p, ...rest } = prev;
                void _p;
                return rest;
              });
            }}
            error={errors.price}
            required
          />
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
            className={cn(
              fieldClass,
              "mt-1.5",
              errors.walletId && "border-danger focus-visible:ring-danger",
            )}
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
                  fieldClass,
                  "pl-10",
                  errors.date && "border-danger focus-visible:ring-danger",
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
      </div>
    </Modal>
  );
}
