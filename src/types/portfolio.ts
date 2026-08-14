export interface PortfolioSummary {
  totalBalance: number
  totalInflows: number
  totalOutflows: number
  totalTransactions: number
  balanceChangePercent: number
}

export interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
}
