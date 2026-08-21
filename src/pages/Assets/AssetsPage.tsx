import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  Grid3X3,
  LayoutList,
  Plus,
  RefreshCw,
  Table as TableIcon,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { cn, generateId } from "../../lib/utils";
import { db } from "../../database/db";
import type {
  AssetEntity,
  AssetMovement,
  AssetPosition,
  Wallet,
} from "../../types";
import {
  computeAssetRows,
  computeAssetsSummary,
  recomputePositionForMovements,
  resolveWalletName,
} from "./assetsLogic";
import { AssetsSummaryCard } from "./AssetsSummaryCard";
import { AssetsTable } from "./AssetsTable";
import { AssetsGrid } from "./AssetsGrid";
import { AssetsActivity } from "./AssetsActivity";
import {
  AddAssetModal,
  type AddAssetData,
} from "./AddAssetModal";
import {
  AssetActionModal,
  type AssetActionData,
} from "./AssetActionModal";
import { UpdatePricesModal } from "./UpdatePricesModal";
import {
  EditAssetModal,
  type EditAssetData,
} from "./EditAssetModal";
import { DeleteAssetModal } from "./DeleteAssetModal";
import {
  EditActivityModal,
  type EditActivityData,
} from "./EditActivityModal";
import { DeleteActivityModal } from "./DeleteActivityModal";
import { LiveCryptoPrices } from "../../components/modules/LiveCryptoPrices";

type ViewMode = "table" | "grid";

interface Feedback {
  type: "success" | "error";
  message: string;
}

export default function Assets() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<AssetEntity[]>([]);
  const [positions, setPositions] = useState<AssetPosition[]>([]);
  const [movements, setMovements] = useState<AssetMovement[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("all");
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    defaultAssetId?: string;
  }>({ open: false });
  const [isUpdatePricesOpen, setIsUpdatePricesOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetEntity | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<AssetEntity | null>(null);
  const [editingMovement, setEditingMovement] = useState<AssetMovement | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<AssetMovement | null>(null);

  const showFeedback = useCallback((message: string, type: Feedback["type"] = "success") => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Load persisted data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [walletRows, assetRows, positionRows, movementRows] =
          await Promise.all([
            db.wallets.toArray(),
            db.assets.toArray(),
            db.assetPositions.toArray(),
            db.assetMovements.toArray(),
          ]);
        if (!mounted) return;
        if (walletRows.length > 0) setWallets(walletRows);
        if (assetRows.length > 0) setAssets(assetRows);
        if (positionRows.length > 0) setPositions(positionRows);
        if (movementRows.length > 0) setMovements(movementRows);
      } catch (error) {
        if (mounted) {
          console.error("Error loading assets data", error);
          setLoadError("Failed to load assets data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(
    () => computeAssetRows(assets, positions),
    [assets, positions],
  );

  const summary = useMemo(() => computeAssetsSummary(rows), [rows]);

  const displayedRows = useMemo(() => {
    if (selectedAssetId === "all") return rows;
    return rows.filter((row) => row.asset.id === selectedAssetId);
  }, [rows, selectedAssetId]);

  const upsertPosition = (
    list: AssetPosition[],
    position: AssetPosition,
  ): AssetPosition[] => {
    const existing = list.find((p) => p.id === position.id);
    if (!existing) return [...list, position];
    return list.map((p) => (p.id === position.id ? position : p));
  };

  const upsertAsset = (
    list: AssetEntity[],
    asset: AssetEntity,
  ): AssetEntity[] => {
    const existing = list.find((a) => a.id === asset.id);
    if (!existing) return [...list, asset];
    return list.map((a) => (a.id === asset.id ? asset : a));
  };

  // ============================================================
  // Add Asset (2-step wizard)
  // ============================================================
  const handleAddAsset = async (data: AddAssetData) => {
    const now = new Date().toISOString();

    let asset = data.asset;
    if (!assets.some((a) => a.id === asset.id)) {
      const newAsset: AssetEntity = {
        ...asset,
        currentPrice: asset.currentPrice || data.purchasePrice,
        createdAt: now,
        updatedAt: now,
      };
      try {
        await db.assets.add(newAsset);
      } catch (error) {
        console.error("Error adding asset to DB", error);
      }
      asset = newAsset;
    } else {
      const existing = assets.find((a) => a.id === asset.id);
      asset = existing ?? asset;
    }

    const existingPosition = positions.find(
      (p) => p.assetId === asset.id && p.walletId === data.walletId,
    );

    let position: AssetPosition;
    if (existingPosition) {
      const newQuantity = existingPosition.quantity + data.initialQuantity;
      const newPurchasePrice =
        newQuantity > 0
          ? (existingPosition.quantity * existingPosition.purchasePrice +
              data.initialQuantity * data.purchasePrice) /
            newQuantity
          : data.purchasePrice;
      position = {
        ...existingPosition,
        quantity: newQuantity,
        purchasePrice: newPurchasePrice,
        updatedAt: now,
      };
    } else {
      position = {
        id: generateId(),
        assetId: asset.id,
        walletId: data.walletId,
        quantity: data.initialQuantity,
        purchasePrice: data.purchasePrice,
        createdAt: now,
        updatedAt: now,
      };
    }

    const movement: AssetMovement = {
      id: generateId(),
      assetId: asset.id,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      quantity: data.initialQuantity,
      priceAtAction: data.purchasePrice,
      currentValue: data.initialQuantity * data.purchasePrice,
      walletId: data.walletId,
      walletName: resolveWalletName(data.walletId, wallets),
      actionType: "add",
      date: data.date,
      createdAt: now,
    };

    try {
      await Promise.all([
        db.assetPositions.put(position),
        db.assetMovements.add(movement),
      ]);
    } catch (error) {
      console.error("Error saving asset position to DB", error);
    }

    setAssets((prev) => upsertAsset(prev, asset));
    setPositions((prev) => upsertPosition(prev, position));
    setMovements((prev) => [movement, ...prev]);
    setIsAddAssetOpen(false);
    showFeedback(`${asset.symbol} added successfully`);
  };

  // ============================================================
  // Add / Remove quantity
  // ============================================================
  const handleAction = async (data: AssetActionData) => {
    const now = new Date().toISOString();
    const asset = assets.find((a) => a.id === data.assetId);
    if (!asset) return;

    const existingPosition = positions.find(
      (p) => p.assetId === data.assetId && p.walletId === data.walletId,
    );

    if (data.actionType === "remove") {
      if (!existingPosition || existingPosition.quantity < data.quantity) {
        showFeedback("Cannot remove more quantity than available", "error");
        return;
      }
    }

    let position: AssetPosition;
    if (existingPosition) {
      const quantity =
        data.actionType === "add"
          ? existingPosition.quantity + data.quantity
          : existingPosition.quantity - data.quantity;
      const purchasePrice =
        data.actionType === "add"
          ? (existingPosition.quantity * existingPosition.purchasePrice +
              data.quantity * data.pricePerUnit) /
            quantity
          : existingPosition.purchasePrice;
      position = {
        ...existingPosition,
        quantity,
        purchasePrice,
        updatedAt: now,
      };
    } else {
      position = {
        id: generateId(),
        assetId: data.assetId,
        walletId: data.walletId,
        quantity: data.quantity,
        purchasePrice: data.pricePerUnit,
        createdAt: now,
        updatedAt: now,
      };
    }

    const movement: AssetMovement = {
      id: generateId(),
      assetId: asset.id,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      quantity: data.quantity,
      priceAtAction: data.pricePerUnit,
      currentValue: data.quantity * data.pricePerUnit,
      walletId: data.walletId,
      walletName: resolveWalletName(data.walletId, wallets),
      actionType: data.actionType,
      date: data.date,
      createdAt: now,
    };

    try {
      await Promise.all([
        db.assetPositions.put(position),
        db.assetMovements.add(movement),
      ]);
    } catch (error) {
      console.error("Error saving asset movement to DB", error);
    }

    setPositions((prev) => upsertPosition(prev, position));
    setMovements((prev) => [movement, ...prev]);
    setActionModal({ open: false });
    showFeedback(
      `${data.actionType === "add" ? "Added" : "Removed"} ${asset.symbol} ${data.quantity}`,
    );
  };

  // ============================================================
  // Update prices
  // ============================================================
  const handleUpdatePrices = async (prices: Record<string, number>) => {
    const now = new Date().toISOString();
    const updatedAssets = assets.map((asset) =>
      prices[asset.id] !== undefined
        ? { ...asset, currentPrice: prices[asset.id], updatedAt: now }
        : asset,
    );

    try {
      await Promise.all(
        updatedAssets.map((asset) =>
          prices[asset.id] !== undefined ? db.assets.put(asset) : Promise.resolve(),
        ),
      );
    } catch (error) {
      console.error("Error updating asset prices in DB", error);
    }

    setAssets(updatedAssets);
    setIsUpdatePricesOpen(false);
    showFeedback("Prices updated successfully");
  };

  // ============================================================
  // Edit asset
  // ============================================================
  const handleEditAsset = async (asset: AssetEntity, data: EditAssetData) => {
    const now = new Date().toISOString();
    const updated: AssetEntity = {
      ...asset,
      name: data.name,
      symbol: data.symbol,
      type: data.type,
      updatedAt: now,
    };

    try {
      await db.assets.put(updated);
      const affectedMovements = movements.filter(
        (m) => m.assetId === asset.id,
      );
      if (affectedMovements.length > 0) {
        await Promise.all(
          affectedMovements.map((movement) =>
            db.assetMovements.update(movement.id, {
              assetName: data.name,
              assetSymbol: data.symbol,
            }),
          ),
        );
      }
    } catch (error) {
      console.error("Error updating asset in DB", error);
    }

    setAssets((prev) =>
      prev.map((a) => (a.id === asset.id ? updated : a)),
    );
    setMovements((prev) =>
      prev.map((m) =>
        m.assetId === asset.id
          ? { ...m, assetName: data.name, assetSymbol: data.symbol }
          : m,
      ),
    );
    setEditingAsset(null);
    showFeedback(`${updated.symbol} updated successfully`);
  };

  // ============================================================
  // Delete asset
  // ============================================================
  const handleDeleteAsset = async (asset: AssetEntity) => {
    try {
      await Promise.all([
        db.assetPositions.where("assetId").equals(asset.id).delete(),
        db.assetMovements.where("assetId").equals(asset.id).delete(),
        db.assets.delete(asset.id),
      ]);
    } catch (error) {
      console.error("Error deleting asset from DB", error);
    }

    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setPositions((prev) => prev.filter((p) => p.assetId !== asset.id));
    setMovements((prev) => prev.filter((m) => m.assetId !== asset.id));
    if (expandedAssetId === asset.id) setExpandedAssetId(null);
    if (selectedAssetId === asset.id) setSelectedAssetId("all");
    setDeletingAsset(null);
    showFeedback(`${asset.symbol} deleted successfully`);
  };

  // ============================================================
  // Recompute a position by replaying its movements
  // ============================================================
  const recomputePosition = async (
    assetId: string,
    walletId: string,
    source: AssetMovement[],
  ) => {
    const assetMovements = source.filter(
      (m) => m.assetId === assetId && m.walletId === walletId,
    );
    const computed = recomputePositionForMovements(assetMovements);
    const existing = positions.find(
      (p) => p.assetId === assetId && p.walletId === walletId,
    );

    if (computed.quantity <= 0) {
      if (existing) {
        try {
          await db.assetPositions.delete(existing.id);
        } catch (error) {
          console.error("Error deleting asset position from DB", error);
        }
        setPositions((prev) => prev.filter((p) => p.id !== existing.id));
      }
      return;
    }

    const now = new Date().toISOString();
    const position: AssetPosition = existing
      ? { ...existing, ...computed, updatedAt: now }
      : {
          id: generateId(),
          assetId,
          walletId,
          ...computed,
          createdAt: now,
          updatedAt: now,
        };

    try {
      await db.assetPositions.put(position);
    } catch (error) {
      console.error("Error saving asset position to DB", error);
    }
    setPositions((prev) => upsertPosition(prev, position));
  };

  // ============================================================
  // Edit activity
  // ============================================================
  const handleEditMovement = async (
    movement: AssetMovement,
    data: EditActivityData,
  ) => {
    const updated: AssetMovement = {
      ...movement,
      quantity: data.quantity,
      priceAtAction: data.price,
      currentValue: data.quantity * data.price,
      walletId: data.walletId,
      walletName: resolveWalletName(data.walletId, wallets),
      date: data.date,
    };

    const nextMovements = movements.map((m) =>
      m.id === movement.id ? updated : m,
    );

    try {
      await db.assetMovements.update(movement.id, {
        quantity: data.quantity,
        priceAtAction: data.price,
        currentValue: data.quantity * data.price,
        walletId: data.walletId,
        walletName: updated.walletName,
        date: data.date,
      });
      await recomputePosition(movement.assetId, movement.walletId, nextMovements);
      if (data.walletId !== movement.walletId) {
        await recomputePosition(movement.assetId, data.walletId, nextMovements);
      }
    } catch (error) {
      console.error("Error updating activity in DB", error);
    }

    setMovements(nextMovements);
    setEditingMovement(null);
    showFeedback(`${updated.assetSymbol} activity updated successfully`);
  };

  // ============================================================
  // Delete activity
  // ============================================================
  const handleDeleteMovement = async (movement: AssetMovement) => {
    const nextMovements = movements.filter((m) => m.id !== movement.id);

    try {
      await db.assetMovements.delete(movement.id);
      await recomputePosition(movement.assetId, movement.walletId, nextMovements);
    } catch (error) {
      console.error("Error deleting activity from DB", error);
    }

    setMovements(nextMovements);
    setDeletingMovement(null);
    showFeedback(`${movement.assetSymbol} activity deleted successfully`);
  };

  const clearFilter = () => {
    setSelectedAssetId("all");
    setExpandedAssetId(null);
  };

  const toggleExpand = (assetId: string) => {
    setExpandedAssetId((prev) => (prev === assetId ? null : assetId));
  };

  const openActionForAsset = (assetId?: string) => {
    setActionModal({ open: true, defaultAssetId: assetId });
  };

  const deletingPositions = deletingAsset
    ? positions.filter((p) => p.assetId === deletingAsset.id).length
    : 0;
  const deletingActivities = deletingAsset
    ? movements.filter((m) => m.assetId === deletingAsset.id).length
    : 0;

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        <Helmet>
          <title>Assets | Asset Portfolio Manager Lite</title>
        </Helmet>
        <PageHeader title="Assets" subtitle="Track and manage your portfolio holdings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="card p-4 h-28 animate-pulse">
              <div className="h-3 w-20 bg-surface-elevated rounded" />
              <div className="mt-4 h-5 w-28 bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
        <div className="card p-8 animate-pulse">
          <div className="h-4 w-40 bg-surface-elevated rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 w-full bg-surface-elevated rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      <Helmet>
        <title>Assets | Asset Portfolio Manager Lite</title>
        <meta
          name="description"
          content="Track and manage your portfolio holdings"
        />
        <meta
          name="keywords"
          content="assets, portfolio, holdings, track, manage"
        />
      </Helmet>

      {/* 1. PageHeader */}
      <PageHeader
        title="Assets"
        subtitle="Track and manage your portfolio holdings"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddAssetOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        }
      />

      {/* Feedback */}
      {feedback && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium animate-toast",
            feedback.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger",
          )}
        >
          <AlertCircle className="h-4 w-4" />
          {feedback.message}
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* 2. Summary Cards Assets */}
      <AssetsSummaryCard summary={summary} />

      {/* 3. All Asset Table/Grid */}
      <section className="card flex flex-col overflow-hidden">
        {/* Section toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-6 py-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center rounded-md border border-border bg-surface-elevated p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "table"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Grid
              </button>
            </div>

            {/* Asset filter */}
            <div className="relative">
              <select
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  setExpandedAssetId(null);
                }}
                className="h-9 px-3 pr-8 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Assets</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.symbol}
                  </option>
                ))}
              </select>
              {selectedAssetId !== "all" && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary rounded"
                  title="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openActionForAsset()}
            >
              <Plus className="h-4 w-4" />
              Action
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUpdatePricesOpen(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Update Prices
            </Button>
          </div>
        </div>

        {/* Content */}
        {assets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
              <LayoutList className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                No assets yet
              </p>
              <p className="mt-1 text-xs text-text-muted max-w-sm">
                There are no assets registered. Add your first asset to start
                tracking your positions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddAssetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add your first asset
            </Button>
          </div>
        ) : displayedRows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
              <LayoutList className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                No assets match the filter
              </p>
              <p className="mt-1 text-xs text-text-muted max-w-sm">
                No asset corresponds to the selected filter. Clear the filter to
                see all assets.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearFilter}>
              Clear filter
            </Button>
          </div>
        ) : viewMode === "table" ? (
          <AssetsTable
            rows={displayedRows}
            wallets={wallets}
            expandedId={expandedAssetId}
            onToggleExpand={toggleExpand}
            onEdit={setEditingAsset}
            onDelete={setDeletingAsset}
          />
        ) : (
          <div className="p-4">
            <AssetsGrid
              rows={displayedRows}
              wallets={wallets}
              expandedId={expandedAssetId}
              onToggleExpand={toggleExpand}
              onEdit={setEditingAsset}
              onDelete={setDeletingAsset}
            />
          </div>
        )}
      </section>

      {/* Live Crypto Prices */}
      <LiveCryptoPrices />

      {/* 4. All Activity */}
      <AssetsActivity
        movements={movements}
        wallets={wallets}
        onEdit={setEditingMovement}
        onDelete={setDeletingMovement}
      />

      {/* Modals */}
      <AddAssetModal
        open={isAddAssetOpen}
        wallets={wallets}
        existingAssets={assets}
        onClose={() => setIsAddAssetOpen(false)}
        onSubmit={handleAddAsset}
      />
      <AssetActionModal
        open={actionModal.open}
        assets={assets}
        wallets={wallets}
        positions={positions}
        defaultAssetId={actionModal.defaultAssetId}
        onClose={() => setActionModal({ open: false })}
        onSubmit={handleAction}
      />
      <UpdatePricesModal
        open={isUpdatePricesOpen}
        rows={rows}
        wallets={wallets}
        onClose={() => setIsUpdatePricesOpen(false)}
        onSubmit={handleUpdatePrices}
      />
      <EditAssetModal
        open={editingAsset !== null}
        asset={editingAsset ?? undefined}
        onClose={() => setEditingAsset(null)}
        onSubmit={handleEditAsset}
      />
      <DeleteAssetModal
        open={deletingAsset !== null}
        asset={deletingAsset ?? undefined}
        positionCount={deletingPositions}
        activityCount={deletingActivities}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDeleteAsset}
      />
      <EditActivityModal
        open={editingMovement !== null}
        movement={editingMovement ?? undefined}
        wallets={wallets}
        onClose={() => setEditingMovement(null)}
        onSubmit={handleEditMovement}
      />
      <DeleteActivityModal
        open={deletingMovement !== null}
        movement={deletingMovement ?? undefined}
        onClose={() => setDeletingMovement(null)}
        onConfirm={handleDeleteMovement}
      />
    </div>
  );
}