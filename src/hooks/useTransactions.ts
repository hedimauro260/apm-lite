import { useEffect, useState, useCallback } from 'react';
import { db } from '../database/db';
import type { Transaction, Wallet } from '../types';
import { useToast } from '../components/ui/Toast';

export interface TransactionRow {
    id: string;
    originalId: string;
    walletId: string;
    walletName: string;
    amount: number;
    displayType: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out' | 'add' | 'remove';
    coin: string;
    website?: string;
    status: string;
    date: string;
    description?: string;
}

export interface CreateTransactionData {
    type: 'deposit' | 'withdraw' | 'transfer' | 'adjust';
    walletId: string;
    relatedWalletId?: string;
    amount: number;
    coin: string;
    status: 'completed' | 'pending' | 'failed';
    date: string;
    description?: string;
    website?: string;
}

export interface UseTransactionsReturn {
    transactions: Transaction[];
    wallets: Wallet[];
    isLoading: boolean;
    error: string | null;
    expandTransactions: (txs: Transaction[]) => TransactionRow[];
    createTransaction: (data: CreateTransactionData) => Promise<void>;
    updateTransaction: (data: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [txData, wData] = await Promise.all([
                db.transactions.toArray(),
                db.wallets.toArray(),
            ]);
            setTransactions(txData);
            setWallets(wData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load transactions';
            setError(message);
            console.error('Error loading transactions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Expande transações (transfer vira 2 linhas, adjust vira add/remove)
    const expandTransactions = useCallback(
        (txs: Transaction[]): TransactionRow[] => {
            const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
            const rows: TransactionRow[] = [];

            txs.forEach((tx) => {
                const walletName = walletMap.get(tx.walletId) || 'Unknown';
                const relatedWalletName = tx.relatedWalletId
                    ? walletMap.get(tx.relatedWalletId)
                    : null;

                if (tx.type === 'transfer' && tx.relatedWalletId) {
                    // Transfer Out (wallet de origem)
                    rows.push({
                        id: `${tx.id}_out`,
                        originalId: tx.id,
                        walletId: tx.walletId,
                        walletName,
                        amount: tx.amount < 0 ? tx.amount : -Math.abs(tx.amount),
                        displayType: 'transfer_out',
                        coin: tx.coin,
                        status: tx.status,
                        date: tx.date,
                        description: tx.description,
                    });
                    // Transfer In (wallet de destino)
                    rows.push({
                        id: `${tx.id}_in`,
                        originalId: tx.id,
                        walletId: tx.relatedWalletId,
                        walletName: relatedWalletName || 'Unknown',
                        amount: Math.abs(tx.amount),
                        displayType: 'transfer_in',
                        coin: tx.coin,
                        status: tx.status,
                        date: tx.date,
                        description: tx.description,
                    });
                } else if (tx.type === 'adjust') {
                    rows.push({
                        id: tx.id,
                        originalId: tx.id,
                        walletId: tx.walletId,
                        walletName,
                        amount: tx.amount,
                        displayType: tx.amount >= 0 ? 'add' : 'remove',
                        coin: tx.coin,
                        status: tx.status,
                        date: tx.date,
                        description: tx.description,
                    });
                } else {
                    // deposit ou withdraw
                    rows.push({
                        id: tx.id,
                        originalId: tx.id,
                        walletId: tx.walletId,
                        walletName,
                        amount: tx.amount,
                        displayType: tx.type === 'deposit' ? 'deposit' : 'withdraw',
                        coin: tx.coin,
                        website: tx.website,
                        status: tx.status,
                        date: tx.date,
                        description: tx.description,
                    });
                }
            });

            return rows.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        [wallets]
    );

    // Create
    const createTransaction = async (data: CreateTransactionData) => {
        try {
            const newTx: Transaction = {
                id: crypto.randomUUID(),
                walletId: data.walletId,
                relatedWalletId: data.relatedWalletId,
                amount: data.amount,
                type: data.type,
                status: data.status,
                coin: data.coin,
                date: data.date,
                description: data.description,
                website: data.website,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.transactions.add(newTx);

            // Atualizar saldo da wallet de origem
            const wallet = wallets.find((w) => w.id === data.walletId);
            if (wallet) {
                await db.wallets.update(data.walletId, {
                    balance: wallet.balance + data.amount,
                    updatedAt: new Date().toISOString(),
                });
            }

            // Para transfer, atualizar também a wallet relacionada
            if (data.type === 'transfer' && data.relatedWalletId) {
                const relatedWallet = wallets.find((w) => w.id === data.relatedWalletId);
                if (relatedWallet) {
                    await db.wallets.update(data.relatedWalletId, {
                        balance: relatedWallet.balance - data.amount,
                        updatedAt: new Date().toISOString(),
                    });
                }
            }

            await loadData();

            toast({
                type: 'success',
                title: 'Transaction added',
                message: `${data.type} of ${data.coin} ${Math.abs(data.amount)} completed`,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add transaction';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Update
    const updateTransaction = async (data: Partial<Transaction>) => {
        try {
            if (!data.id) return;

            const originalTx = transactions.find((t) => t.id === data.id);
            if (!originalTx) throw new Error('Transaction not found');

            const amountDiff = (data.amount || 0) - originalTx.amount;

            await db.transactions.update(data.id, {
                ...data,
                updatedAt: new Date().toISOString(),
            });

            // Atualizar saldo da wallet com a diferença
            const wallet = wallets.find((w) => w.id === originalTx.walletId);
            if (wallet) {
                await db.wallets.update(originalTx.walletId, {
                    balance: wallet.balance + amountDiff,
                    updatedAt: new Date().toISOString(),
                });
            }

            await loadData();

            toast({
                type: 'success',
                title: 'Transaction updated',
                message: 'Transaction has been updated successfully',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update transaction';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Delete
    const deleteTransaction = async (id: string) => {
        try {
            const tx = transactions.find((t) => t.id === id);
            if (!tx) throw new Error('Transaction not found');

            // Reverter o saldo da wallet
            const wallet = wallets.find((w) => w.id === tx.walletId);
            if (wallet) {
                await db.wallets.update(tx.walletId, {
                    balance: wallet.balance - tx.amount,
                    updatedAt: new Date().toISOString(),
                });
            }

            await db.transactions.delete(id);
            await loadData();

            toast({
                type: 'success',
                title: 'Transaction deleted',
                message: 'Transaction has been removed successfully',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete transaction';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Refresh manual
    const refresh = async () => {
        await loadData();
    };

    return {
        transactions,
        wallets,
        isLoading,
        error,
        expandTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        refresh,
    };
}