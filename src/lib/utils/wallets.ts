import type { Transaction, Wallet } from "../../types"

export function computeWalletBalance(
  walletId: string,
  transactions: Transaction[],
): number {
  let balance = 0

  for (const t of transactions) {
    if (t.status !== "completed") continue

    if (t.type === "transfer") {
      if (t.walletId === walletId) balance -= Math.abs(t.amount)
      if (t.relatedWalletId === walletId) balance += Math.abs(t.amount)
    } else if (t.walletId === walletId) {
      balance += t.amount
    }
  }

  return Number(balance.toFixed(2))
}

export function withWalletBalances(
  wallets: Wallet[],
  transactions: Transaction[],
): Wallet[] {
  return wallets.map((wallet) => ({
    ...wallet,
    balance: computeWalletBalance(wallet.id, transactions),
  }))
}
