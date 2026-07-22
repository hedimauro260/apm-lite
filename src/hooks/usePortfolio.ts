// src/hooks/usePortfolio.ts
import { useMemo, useCallback } from 'react';
import { useLivePortfolioData } from './useLiveQuery';
import { subDays, format } from 'date-fns';

export function usePortfolio() {
    const rawData = useLivePortfolioData();
    const isLoading = rawData === undefined;

    const data = useMemo(() => {
        if (!rawData) return null;

        const { wallets, assets, transactions } = rawData;

        // 1. Total Balance
        const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

        // 2. Calcular variações (vs ontem)
        const today = new Date();
        const yesterday = subDays(today, 1);
        const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

        // Buscar transações de ontem
        const yesterdayTxs = transactions.filter(tx => {
            const txDate = format(new Date(tx.date), 'yyyy-MM-dd');
            return txDate === yesterdayStr;
        });

        // ============================================================
        // ✅ CÁLCULO DOS INFLOWS E OUTFLOWS DE ONTEM
        // ============================================================
        let yesterdayInflows = 0;
        let yesterdayOutflows = 0;
        yesterdayTxs.forEach(t => {
            const amount = Math.abs(t.amount);
            if (t.type === 'deposit' || (t.type === 'adjust' && t.amount > 0)) {
                yesterdayInflows += amount;
            } else if (t.type === 'withdraw' || (t.type === 'adjust' && t.amount < 0)) {
                yesterdayOutflows += amount;
            }
        });

        // 3. Inflows/Outflows Totais
        let totalInflows = 0;
        let totalOutflows = 0;
        let totalTransactions = 0;

        transactions.forEach((t) => {
            const amount = Math.abs(t.amount);
            totalTransactions++;
            if (t.type === 'deposit') totalInflows += amount;
            else if (t.type === 'withdraw') totalOutflows += amount;
            else if (t.type === 'adjust' && t.amount > 0) totalInflows += amount;
            else if (t.type === 'adjust' && t.amount < 0) totalOutflows += amount;
        });

        // ============================================================
        // ✅ CALCULAR VARIAÇÕES PERCENTUAIS
        // ============================================================

        // Variação do Total Balance
        const yesterdayNetChange = yesterdayTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const yesterdayBalance = totalBalance - yesterdayNetChange;
        const balanceChange = totalBalance - yesterdayBalance;
        const balanceVariation = yesterdayBalance !== 0
            ? (balanceChange / yesterdayBalance) * 100
            : 0;

        // Variação dos Inflows
        const inflowsVariation = yesterdayInflows !== 0
            ? ((totalInflows - yesterdayInflows) / yesterdayInflows) * 100
            : totalInflows > 0 ? 100 : 0;

        // Variação dos Outflows
        const outflowsVariation = yesterdayOutflows !== 0
            ? ((totalOutflows - yesterdayOutflows) / yesterdayOutflows) * 100
            : totalOutflows > 0 ? 100 : 0;

        // Variação das Transações
        const yesterdayTxCount = yesterdayTxs.length;
        const transactionsVariation = yesterdayTxCount !== 0
            ? ((totalTransactions - yesterdayTxCount) / yesterdayTxCount) * 100
            : totalTransactions > 0 ? 100 : 0;

        // 4. Sparklines (últimos 7 dias)
        const sparklines = {
            balance: [] as number[],
            inflows: [] as number[],
            outflows: [] as number[],
            transactions: [] as number[],
        };

        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const dayTxs = transactions.filter(tx => {
                const txDate = format(new Date(tx.date), 'yyyy-MM-dd');
                return txDate === dateStr;
            });

            const dayNetChange = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
            const dayBalance = totalBalance - dayNetChange;

            let dayInflows = 0;
            let dayOutflows = 0;
            dayTxs.forEach(t => {
                const amount = Math.abs(t.amount);
                if (t.type === 'deposit' || (t.type === 'adjust' && t.amount > 0)) {
                    dayInflows += amount;
                } else if (t.type === 'withdraw' || (t.type === 'adjust' && t.amount < 0)) {
                    dayOutflows += amount;
                }
            });

            sparklines.balance.push(dayBalance);
            sparklines.inflows.push(dayInflows);
            sparklines.outflows.push(dayOutflows);
            sparklines.transactions.push(dayTxs.length);
        }

        // 5. Distribuição por Wallet
        const walletDistribution = wallets.map((w) => ({
            id: w.id,
            name: w.name,
            value: w.balance,
            percentage: totalBalance > 0 ? (w.balance / totalBalance) * 100 : 0,
        }));

        // 6. Distribuição por Asset
        const assetMap = new Map<string, { name: string; value: number }>();
        assets.forEach((a) => {
            const current = assetMap.get(a.symbol) || { name: a.name, value: 0 };
            current.value += a.currentValue;
            assetMap.set(a.symbol, current);
        });

        const totalAssetValue = Array.from(assetMap.values()).reduce((sum, a) => sum + a.value, 0);
        const assetDistribution = Array.from(assetMap.entries()).map(([symbol, assetData]) => ({
            id: symbol,
            symbol,
            name: assetData.name,
            value: assetData.value,
            percentage: totalAssetValue > 0 ? (assetData.value / totalAssetValue) * 100 : 0,
        }));

        return {
            totalBalance,
            totalInflows,
            totalOutflows,
            totalTransactions,
            // ✅ Variações calculadas dinamicamente
            balanceVariation,
            balanceChange,
            inflowsVariation,
            outflowsVariation,
            transactionsVariation,
            sparklines,
            walletDistribution,
            assetDistribution,
        };
    }, [rawData]);

    const refresh = useCallback(async () => { }, []);

    return { data, isLoading, refresh };
}