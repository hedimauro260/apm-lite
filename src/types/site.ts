import type { BaseEntity } from "./common"

export type SiteStatus = "active" | "inactive"
export type SiteMovementType = "earn" | "withdraw"

export interface Site extends BaseEntity {
  name: string
  url?: string
  initialBalance: number
  balance: number
  status: SiteStatus
  color?: string
  description?: string
}

export interface SiteMovement extends BaseEntity {
  siteId: string
  type: SiteMovementType
  amount: number
  walletId?: string
  date: string
  balanceAfter: number
  description?: string
}
