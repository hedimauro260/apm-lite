export function getWalletColor(type: string): string {
  const colors: Record<string, string> = {
    main: "text-blue-500 bg-blue-500/10",
    savings: "text-purple-500 bg-purple-500/10",
    trading: "text-amber-500 bg-amber-500/10",
    cold: "text-green-500 bg-green-500/10",
  }
  return colors[type] || "text-gray-500 bg-gray-500/10"
}

export function getCryptoColor(symbol: string): string {
  const colors: Record<string, string> = {
    BTC: "text-orange-500",
    ETH: "text-blue-500",
    SOL: "text-purple-500",
    BNB: "text-yellow-500",
    ADA: "text-blue-700",
    XRP: "text-gray-700",
  }
  return colors[symbol.toUpperCase()] || "text-gray-400"
}
