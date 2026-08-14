import type { BaseEntity } from "./common"

export type TransactionType = "deposit" | "withdraw" | "transfer" | "adjust"
export type TransactionStatus = "completed" | "pending" | "failed"

export interface Transaction extends BaseEntity {
  walletId: string
  assetId?: string
  relatedWalletId?: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  date: string
  description?: string
  website?: string
  countsTowardsGoals?: boolean
}
