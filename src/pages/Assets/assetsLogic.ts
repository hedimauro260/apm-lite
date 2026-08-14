import type { AssetEntity, AssetMovement, AssetPosition } from "../../types";

export interface AssetRow {
  asset: AssetEntity;
  positions: AssetPosition[];
  totalQuantity: number;
  purchaseValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  walletCount: number;
  participation: number;
}

export interface AssetsSummary {
  totalAssets: number;
  totalValue: number;
  bestPnl: AssetRow | null;
  worstPnl: AssetRow | null;
  largestAsset: AssetRow | null;
}

export function computeAssetRows(
  assets: AssetEntity[],
  positions: AssetPosition[],
): AssetRow[] {
  const rows: AssetRow[] = [];

  assets.forEach((asset) => {
    const assetPositions = positions.filter((p) => p.assetId === asset.id);
    const totalQuantity = assetPositions.reduce(
      (sum, p) => sum + p.quantity,
      0,
    );
    const purchaseValue = assetPositions.reduce(
      (sum, p) => sum + p.quantity * p.purchasePrice,
      0,
    );
    const currentValue = totalQuantity * asset.currentPrice;
    const pnl = currentValue - purchaseValue;
    const walletCount = new Set(assetPositions.map((p) => p.walletId)).size;

    rows.push({
      asset,
      positions: assetPositions,
      totalQuantity,
      purchaseValue,
      currentValue,
      pnl,
      pnlPercent: purchaseValue > 0 ? (pnl / purchaseValue) * 100 : 0,
      walletCount,
      participation: 0,
    });
  });

  const totalValue = rows.reduce((sum, row) => sum + row.currentValue, 0);
  rows.forEach((row) => {
    row.participation = totalValue > 0 ? (row.currentValue / totalValue) * 100 : 0;
  });

  return rows.sort((a, b) => b.currentValue - a.currentValue);
}

export function computeAssetsSummary(rows: AssetRow[]): AssetsSummary {
  if (rows.length === 0) {
    return {
      totalAssets: 0,
      totalValue: 0,
      bestPnl: null,
      worstPnl: null,
      largestAsset: null,
    };
  }

  const totalValue = rows.reduce((sum, row) => sum + row.currentValue, 0);
  const bestPnl = rows.reduce((best, row) => (row.pnl > best.pnl ? row : best), rows[0]);
  const worstPnl = rows.reduce((worst, row) => (row.pnl < worst.pnl ? row : worst), rows[0]);
  const largestAsset = rows.reduce(
    (largest, row) => (row.currentValue > largest.currentValue ? row : largest),
    rows[0],
  );

  return {
    totalAssets: rows.length,
    totalValue,
    bestPnl,
    worstPnl,
    largestAsset,
  };
}

export function resolveWalletName(
  walletId: string,
  wallets: { id: string; name: string }[],
): string {
  return wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";
}

export function recomputePositionForMovements(
  movements: AssetMovement[],
): Pick<AssetPosition, "quantity" | "purchasePrice"> {
  const sorted = [...movements].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  let quantity = 0;
  let weightedTotal = 0;
  let totalAdded = 0;

  for (const movement of sorted) {
    if (movement.actionType === "add") {
      weightedTotal += movement.quantity * movement.priceAtAction;
      totalAdded += movement.quantity;
      quantity += movement.quantity;
    } else {
      quantity -= movement.quantity;
    }
  }

  const safeQuantity = Math.max(0, quantity);
  const purchasePrice = totalAdded > 0 ? weightedTotal / totalAdded : 0;
  return { quantity: safeQuantity, purchasePrice };
}