// src/hooks/useWalletsSummary.ts
import { useEffect, useState } from 'react';
import { db } from '../database/db';
import type { Wallet, Transaction } from '../types';

export interface WalletsSummaryData {
    totalWallets: number;
    totalBalance: number;
    totalInflows: number;
    totalOutflows: number;
    totalTransactions: number;
    activeWallets: number;
    inactiveWallets: number;
    isLoading: boolean;
}

export function useWalletsSummary(): WalletsSummaryData {
    const [data, setData] = useState<WalletsSummaryData>({
        totalWallets: 0,
        totalBalance: 0,
        totalInflows: 0,
        totalOutflows: 0,
        totalTransactions: 0,
        activeWallets: 0,
        inactiveWallets: 0,
        isLoading: true,
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const wallets: Wallet[] = await db.wallets.toArray();
                const transactions: Transaction[] = await db.transactions.toArray();

                // 1. Contagem de wallets
                const totalWallets = wallets.length;
                const activeWallets = wallets.filter(w => w.status === 'active').length;
                const inactiveWallets = wallets.filter(w => w.status === 'inactive').length;

                // 2. Saldo total
                const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

                // 3. Inflows e Outflows (IGNORANDO transferências)
                let inflows = 0;
                let outflows = 0;

                transactions.forEach((t) => {
                    const amount = Math.abs(t.amount);

                    // ✅ Inflows: apenas depósitos (entrada de dinheiro externo)
                    if (t.type === 'deposit') {
                        inflows += amount;
                    }
                    // ✅ Outflows: apenas saques (saída de dinheiro externo)
                    else if (t.type === 'withdraw') {
                        outflows += amount;
                    }
                    // ✅ Ajustes: podem ser Inflows (positivo) ou Outflows (negativo)
                    else if (t.type === 'adjust') {
                        if (t.amount > 0) {
                            inflows += amount;
                        } else {
                            outflows += amount;
                        }
                    }
                    // ✅ Transferências: IGNORAR (movimentação interna)
                    // Não fazemos nada para 'transfer'
                });

                setData({
                    totalWallets,
                    totalBalance,
                    totalInflows: inflows,
                    totalOutflows: outflows,
                    totalTransactions: transactions.length,
                    activeWallets,
                    inactiveWallets,
                    isLoading: false,
                });
            } catch (error) {
                console.error('Error fetching wallets summary:', error);
                setData((prev) => ({ ...prev, isLoading: false }));
            }
        }

        fetchData();
    }, []);

    return data;
}