import type { BaseEntity } from "./common"

export type GoalStatus = "active" | "archived"
export type GoalProgressStatus =
  | "Not Started"
  | "Getting Started"
  | "Behind"
  | "On Track"
  | "Excellent"
  | "Completed"

export type DistributionType = "same" | "custom"

export interface GoalDay {
  date: string
  goal: number
}

export interface GoalWalletConfig {
  walletId: string
  weeklyGoal: number
  days: GoalDay[]
}

export interface Goal extends BaseEntity {
  name: string
  status: GoalStatus
  startDate: string
  endDate: string
  distributionType: DistributionType
  totalWeeklyGoal: number
  wallets: GoalWalletConfig[]
  archivedAt?: string
  snapshot?: GoalSnapshot
}

export interface GoalSnapshotDay {
  date: string
  goal: number
  current: number
  percentage: number
  status: GoalProgressStatus
}

export interface GoalSnapshotWalletProgress {
  walletId: string
  walletName: string
  color?: string
  weeklyGoal: number
  weeklyProgress: number
  percentage: number
  status: GoalProgressStatus
  days: GoalSnapshotDay[]
}

export interface GoalSnapshotBestWallet {
  walletId?: string
  walletName: string
  percentage: number
  progress: number
  goal: number
}

export interface GoalSnapshotDeposit {
  transactionId: string
  amount: number
  date: string
  walletName: string
  description?: string
}

export interface GoalSnapshot {
  archivedAt: string
  totalWeeklyGoal: number
  totalWeeklyProgress: number
  remaining: number
  percentage: number
  status: GoalProgressStatus
  streak: number
  bestWallet: GoalSnapshotBestWallet | null
  walletProgress: GoalSnapshotWalletProgress[]
  days: GoalSnapshotDay[]
  deposits: GoalSnapshotDeposit[]
}
