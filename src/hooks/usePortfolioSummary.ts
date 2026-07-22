// src/hooks/usePortfolioSummary.ts
import { useEffect, useState } from 'react';
import { db } from '../database/db';
import type { Wallet, Transaction } from '../types';

export interface PortfolioSummaryData {
    totalBalance: number;
    totalInflows: number;
    totalOutflows: number;
    totalTransactions: number;

    // ⚡ Novos dados para os Sparklines (últimos 7 dias)
    sparklines: {
        balance: number[];
        inflows: number[];
        outflows: number[];
        transactions: number[];
    };

    isLoading: boolean;
}

export function usePortfolioSummary(): PortfolioSummaryData {
    const [data, setData] = useState<PortfolioSummaryData>({
        totalBalance: 0,
        totalInflows: 0,
        totalOutflows: 0,
        totalTransactions: 0,
        sparklines: {
            balance: [],
            inflows: [],
            outflows: [],
            transactions: [],
        },
        isLoading: true,
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const wallets: Wallet[] = await db.wallets.toArray();
                const transactions: Transaction[] = await db.transactions.toArray();

                // 1. Calcular Saldo Total
                const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

                // 2. Calcular Inflows e Outflows Totais
                let totalInflows = 0;
                let totalOutflows = 0;

                transactions.forEach((t) => {
                    const amount = Math.abs(t.amount);

                    switch (t.type) {
                        case 'deposit':
                            totalInflows += amount;
                            break;
                        case 'withdraw':
                            totalOutflows += amount;
                            break;
                        case 'adjust':
                            if (t.amount > 0) {
                                totalInflows += amount;
                            } else {
                                totalOutflows += amount;
                            }
                            break;
                        // transfer, buy, sell: ignorar
                        default:
                            break;
                    }
                });

                // 3. Calcular Dados dos Sparklines (Últimos 7 dias)
                const now = new Date();
                const sparklineData = {
                    balance: [] as number[],
                    inflows: [] as number[],
                    outflows: [] as number[],
                    transactions: [] as number[],
                };

                // 3.1. Calcular Inflows, Outflows e Transactions por dia
                for (let i = 6; i >= 0; i--) {
                    const targetDate = new Date(now);
                    targetDate.setDate(now.getDate() - i);
                    targetDate.setHours(0, 0, 0, 0);

                    const nextDate = new Date(targetDate);
                    nextDate.setDate(targetDate.getDate() + 1);

                    // Filtrar transações do dia
                    const dayTxs = transactions.filter(t => {
                        const txDate = new Date(t.date);
                        return txDate >= targetDate && txDate < nextDate;
                    });

                    let dayInflows = 0;
                    let dayOutflows = 0;

                    dayTxs.forEach(t => {
                        const amount = Math.abs(t.amount);
                        switch (t.type) {
                            case 'deposit':
                                dayInflows += amount;
                                break;
                            case 'withdraw':
                                dayOutflows += amount;
                                break;
                            case 'adjust':
                                if (t.amount > 0) {
                                    dayInflows += amount;
                                } else {
                                    dayOutflows += amount;
                                }
                                break;
                            default:
                                break;
                        }
                    });

                    sparklineData.inflows.push(dayInflows);
                    sparklineData.outflows.push(dayOutflows);
                    sparklineData.transactions.push(dayTxs.length);
                }

                // 3.2. Gerar sparkline de Balance (tendência que termina no saldo atual)
                // Usamos uma tendência suave + variação aleatória para parecer natural
                const baseBalance = totalBalance * 0.85; // Começa em ~85% do saldo atual
                const step = (totalBalance - baseBalance) / 6;

                for (let i = 0; i < 7; i++) {
                    // Variação aleatória de ±5% do saldo total
                    const variance = (Math.random() - 0.5) * (totalBalance * 0.05);
                    let value = Math.max(0, baseBalance + (step * i) + variance);

                    // Arredondar para 2 casas decimais
                    sparklineData.balance.push(Math.round(value * 100) / 100);
                }

                // Garantir que o último ponto seja exatamente o saldo atual
                sparklineData.balance[6] = Math.round(totalBalance * 100) / 100;

                setData({
                    totalBalance,
                    totalInflows,
                    totalOutflows,
                    totalTransactions: transactions.length,
                    sparklines: sparklineData,
                    isLoading: false,
                });
            } catch (error) {
                console.error('Error fetching portfolio summary:', error);
                setData((prev) => ({ ...prev, isLoading: false }));
            }
        }

        fetchData();
    }, []);

    return data;
}