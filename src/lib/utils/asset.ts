import type { Asset } from "../../types"

export interface AggregatedAsset {
  symbol: string
  name: string
  totalQuantity: number
  totalValue: number
  walletCount: number
  type: string
}

export function aggregateAssetsBySymbol(assets: Asset[]): AggregatedAsset[] {
  const grouped = new Map<string, AggregatedAsset>()

  assets.forEach((asset) => {
    const existing = grouped.get(asset.symbol)

    if (existing) {
      existing.totalQuantity += asset.quantity
      existing.totalValue += asset.currentValue
      existing.walletCount += 1
    } else {
      grouped.set(asset.symbol, {
        symbol: asset.symbol,
        name: asset.name,
        totalQuantity: asset.quantity,
        totalValue: asset.currentValue,
        walletCount: 1,
        type: asset.type,
      })
    }
  })

  return Array.from(grouped.values()).sort((a, b) => b.totalValue - a.totalValue)
}
