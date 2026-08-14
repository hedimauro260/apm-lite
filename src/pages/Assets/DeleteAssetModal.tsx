import { Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { AssetEntity } from "../../types";
import { AssetLogo } from "./AssetLogo";

export interface DeleteAssetModalProps {
  open: boolean;
  asset?: AssetEntity;
  positionCount: number;
  activityCount: number;
  onClose: () => void;
  onConfirm: (asset: AssetEntity) => void;
}

export function DeleteAssetModal({
  open,
  asset,
  positionCount,
  activityCount,
  onClose,
  onConfirm,
}: DeleteAssetModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Delete Asset"
      variant="danger"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => asset && onConfirm(asset)}>
            <Trash2 className="h-4 w-4" />
            Delete Asset
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{" "}
          <span className="text-text-primary font-medium">
            {asset?.name ?? "this asset"}
          </span>
          ?{" "}
          <span className="text-text-primary font-medium">
            This action cannot be undone.
          </span>{" "}
          It will remove the asset, its {positionCount} position
          {positionCount !== 1 ? "s" : ""} and {activityCount} activity
          record{activityCount !== 1 ? "s" : ""}.
        </p>

        {asset && (
          <div className="flex items-center gap-3 rounded-lg bg-surface-elevated border border-border px-4 py-3">
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
      </div>
    </Modal>
  );
}