import type { BaseEntity } from "./common"

export type AssetType = "crypto" | "stock" | "fiat" | "other"

export interface Asset extends BaseEntity {
  name: string
  symbol: string
  type: AssetType
  quantity: number
  purchasePrice: number
  currentValue: number
  walletId: string
}

export type AssetMovementType = "add" | "remove"

export interface AssetMovement {
  id: string
  assetId: string
  assetName: string
  assetSymbol: string
  quantity: number
  priceAtAction: number
  currentValue: number
  walletId: string
  walletName: string
  actionType: AssetMovementType
  date: string
  createdAt: string
}

export interface AssetEntity extends BaseEntity {
  name: string
  symbol: string
  type: AssetType
  currentPrice: number
  logo?: string
  color?: string
  isCustom: boolean
}

export interface AssetPosition extends BaseEntity {
  assetId: string
  walletId: string
  quantity: number
  purchasePrice: number
}
