import type { BaseEntity } from "./common"

export type WalletType =
  | "main"
  | "savings"
  | "trading"
  | "cold"
  | "exchange"
  | "hot"
  | "micro"
  | "bank"
  | "cash"
  | "other"

export type WalletStatus = "active" | "inactive"

export interface Wallet extends BaseEntity {
  name: string
  type: WalletType
  balance: number
  status: WalletStatus
  color?: string
  description?: string
  assetIds?: string[]
}
