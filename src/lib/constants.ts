/**
 * Application Constants
 */

// Wallet types
export const WALLET_TYPES = {
  MAIN: "main",
  SAVINGS: "savings",
  TRADING: "trading",
  COLD: "cold",
} as const;

export type WalletType = (typeof WALLET_TYPES)[keyof typeof WALLET_TYPES];

// Transaction types
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
  BUY: "buy",
  SELL: "sell",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

// Transaction status
export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

// Asset types
export const ASSET_TYPES = {
  CRYPTO: "crypto",
  STOCK: "stock",
  FIAT: "fiat",
  OTHER: "other",
} as const;

export type AssetType = (typeof ASSET_TYPES)[keyof typeof ASSET_TYPES];

// Goal status
export const GOAL_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
} as const;

export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_SHORT: "MMM dd",
  TIME: "HH:mm",
  DATETIME: "MMM dd, yyyy HH:mm",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// API endpoints (for future use)
export const API_ENDPOINTS = {
  CRYPTO_PRICES: "https://api.coingecko.com/api/v3/simple/price",
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
  THEME: "apm_theme",
  PREFERENCES: "apm_preferences",
  LAST_SYNC: "apm_last_sync",
} as const;

// Animation durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
} as const;

// Breakpoints (px)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;
