import { Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { AssetMovement } from "../../types";

export interface DeleteActivityModalProps {
  open: boolean;
  movement?: AssetMovement;
  onClose: () => void;
  onConfirm: (movement: AssetMovement) => void;
}

export function DeleteActivityModal({
  open,
  movement,
  onClose,
  onConfirm,
}: DeleteActivityModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Delete Activity"
      variant="danger"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => movement && onConfirm(movement)}>
            <Trash2 className="h-4 w-4" />
            Delete Activity
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete this{" "}
          <span className="text-text-primary font-medium">
            {movement?.actionType ?? "activity"}
          </span>{" "}
          record for{" "}
          <span className="text-text-primary font-medium">
            {movement?.assetName ?? "this asset"}
          </span>
          ?{" "}
          <span className="text-text-primary font-medium">
            This action cannot be undone.
          </span>{" "}
          The affected wallet position will be recalculated from the remaining
          activity.
        </p>

        {movement && (
          <div className="flex items-center gap-3 rounded-lg bg-surface-elevated border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {movement.assetName} · {movement.assetSymbol}
              </p>
              <p className="text-xs text-text-muted">
                {movement.quantity} @ {movement.priceAtAction} ·{" "}
                {new Date(movement.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
