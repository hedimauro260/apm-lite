// src/hooks/useLiveQuery.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';

// ============================================================
// HOOKS PARA CADA TABELA
// ============================================================

/**
 * Observa todas as wallets em tempo real
 */
export function useLiveWallets() {
    return useLiveQuery(
        () => db.wallets.toArray(),
        [] // Dependências vazias = observa sempre
    );
}

/**
 * Observa todas as assets em tempo real
 */
export function useLiveAssets() {
    return useLiveQuery(
        () => db.assets.toArray(),
        []
    );
}

/**
 * Observa todas as transações em tempo real
 */
export function useLiveTransactions() {
    return useLiveQuery(
        () => db.transactions.toArray(),
        []
    );
}

/**
 * Observa todos os goals em tempo real
 */
export function useLiveGoals() {
    return useLiveQuery(
        () => db.goals.toArray(),
        []
    );
}

/**
 * Observa todas as movimentações de assets em tempo real
 */
export function useLiveAssetMovements() {
    return useLiveQuery(
        () => db.assetMovements.toArray(),
        []
    );
}

/**
 * Observa todos os snapshots de goals em tempo real
 */
export function useLiveGoalSnapshots() {
    return useLiveQuery(
        () => db.goalSnapshots.toArray(),
        []
    );
}

// ============================================================
// HOOKS COMBINADOS
// ============================================================

/**
 * Observa wallets e transações em tempo real (para o módulo de wallets)
 */
export function useLiveWalletsWithTransactions() {
    return useLiveQuery(
        async () => {
            const [wallets, transactions] = await Promise.all([
                db.wallets.toArray(),
                db.transactions.toArray(),
            ]);
            return { wallets, transactions };
        },
        []
    );
}

/**
 * Observa todos os dados do portfólio em tempo real
 */
export function useLivePortfolioData() {
    return useLiveQuery(
        async () => {
            const [wallets, assets, transactions] = await Promise.all([
                db.wallets.toArray(),
                db.assets.toArray(),
                db.transactions.toArray(),
            ]);
            return { wallets, assets, transactions };
        },
        []
    );
}

/**
 * Observa dados completos (incluindo goals e snapshots)
 */
export function useLiveFullData() {
    return useLiveQuery(
        async () => {
            const [wallets, assets, transactions, goals, assetMovements, goalSnapshots] = await Promise.all([
                db.wallets.toArray(),
                db.assets.toArray(),
                db.transactions.toArray(),
                db.goals.toArray(),
                db.assetMovements.toArray(),
                db.goalSnapshots.toArray(),
            ]);
            return {
                wallets,
                assets,
                transactions,
                goals,
                assetMovements,
                goalSnapshots,
            };
        },
        []
    );
}

// ============================================================
// HOOKS COM FILTROS
// ============================================================

/**
 * Observa transações de uma wallet específica em tempo real
 */
export function useLiveTransactionsByWallet(walletId: string) {
    return useLiveQuery(
        () => db.transactions.where('walletId').equals(walletId).toArray(),
        [walletId] // Re-executa quando walletId mudar
    );
}

/**
 * Observa transações de um período específico em tempo real
 */
export function useLiveTransactionsByDate(startDate: Date, endDate: Date) {
    return useLiveQuery(
        () => db.transactions
            .where('date')
            .between(startDate.toISOString(), endDate.toISOString())
            .toArray(),
        [startDate, endDate]
    );
}

/**
 * Observa assets de uma wallet específica em tempo real
 */
export function useLiveAssetsByWallet(walletId: string) {
    return useLiveQuery(
        () => db.assets.where('walletId').equals(walletId).toArray(),
        [walletId]
    );
}

/**
 * Observa movimentações de um asset específico em tempo real
 */
export function useLiveAssetMovementsByAsset(assetId: string) {
    return useLiveQuery(
        () => db.assetMovements.where('assetId').equals(assetId).toArray(),
        [assetId]
    );
}