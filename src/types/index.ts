// src/types/index.ts
// ==========================================
// Enums e Uniões de Tipos
// ==========================================

export type WalletType = "main" | "savings" | "trading" | "cold" | "exchange" | "hot" | "micro" | "bank" | "cash" | "other";
export type WalletStatus = "active" | "inactive";

export type AssetType = "crypto" | "stock" | "fiat" | "other";

// Transaction Types
export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'adjust';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

// ==========================================
// Interfaces de Entidades
// ==========================================

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface Wallet extends BaseEntity {
    name: string;
    type: WalletType;
    balance: number;
    status: WalletStatus;
    color?: string;
    description?: string;
}

export interface Asset extends BaseEntity {
    name: string;
    symbol: string;
    type: AssetType;
    quantity: number;
    purchasePrice: number;
    currentValue: number;
    walletId: string;
}

export interface Transaction extends BaseEntity {
    walletId: string;
    assetId?: string;
    relatedWalletId?: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    date: string;
    description?: string;
    website?: string;
    coin: string;
}

// ============================================================
// GOALS & SNAPSHOTS
// ============================================================

export type GoalStatus = 'active' | 'archived' | 'completed';
export type GoalProgressStatus =
    | 'Not Started'
    | 'Getting Started'
    | 'Behind'
    | 'On Track'
    | 'Excellent'
    | 'Completed';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DailyGoals {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
}

export interface GoalWallet {
    walletId: string;
    walletName: string;
    weeklyGoal: number;
    dailyGoals: DailyGoals;
}

export interface Goal extends BaseEntity {
    name: string;
    status: GoalStatus;
    startDate: string;
    endDate: string;
    totalWeeklyGoal: number;
    wallets: GoalWallet[];
}

// ✅ Se precisar de uma versão simplificada para compatibilidade
export interface SimpleGoal extends BaseEntity {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    status: GoalStatus;
}

export interface GoalSnapshotWalletProgress {
    walletId: string;
    walletName: string;
    weeklyGoal: number;
    weeklyProgress: number;
    percentage: number;
    status: GoalProgressStatus;
}

export interface GoalSnapshotBestWallet {
    walletName: string;
    percentage: number;
    progress: number;
    goal: number;
}

export interface GoalSnapshot {
    id: string;
    goalId: string;
    goalName: string;
    archivedAt: string;
    startDate: string;
    endDate: string;
    totalWeeklyGoal: number;
    totalWeeklyProgress: number;
    remaining: number;
    percentage: number;
    streak: number;
    bestWallet: GoalSnapshotBestWallet | null;
    walletProgress: GoalSnapshotWalletProgress[];
}

// ==========================================
// Tipos Agregados (para UI)
// ==========================================

export interface PortfolioSummary {
    totalBalance: number;
    totalInflows: number;
    totalOutflows: number;
    totalTransactions: number;
    balanceChangePercent: number;
}

export interface CryptoPrice {
    symbol: string;
    price: number;
    change24h: number;
}

export type AssetMovementType = 'add' | 'remove';

export interface AssetMovement {
    id: string;
    assetId: string;
    assetName: string;
    assetSymbol: string;
    quantity: number;
    priceAtAction: number;
    currentValue: number;
    walletId: string;
    walletName: string;
    actionType: AssetMovementType;
    date: string;
}