/**
 * APMDatabase - Schema do Dexie (IndexedDB)
 * 
 * VERSIONAMENTO:
 * - v1: wallets, assets, transactions, goals
 * - v2: assetMovements (histórico de add/remove de assets)
 * - v3: goalSnapshots (fotos imutáveis de goals arquivados)
 * 
 * ÍNDICES:
 * Cada tabela tem índices nos campos mais consultados
 * para evitar scans completos (ex: 'walletId', 'status', 'date')
 * 
 * @example
 * await db.wallets.where('status').equals('active').toArray();
 */

import Dexie, { type Table } from "dexie";
import type { Wallet, Asset, Transaction, Goal, AssetMovement, GoalSnapshot } from "../types";

// Estendendo a interface Global Window para tipagem segura do console de debug
declare global {
    interface Window {
        db?: APMDatabase;
    }
}

class APMDatabase extends Dexie {
    // Tabelas
    wallets!: Table<Wallet, string>;
    assets!: Table<Asset, string>;
    transactions!: Table<Transaction, string>;
    goals!: Table<Goal, string>;
    assetMovements!: Table<AssetMovement, string>; // ⚡ NOVA TABELA
    goalSnapshots!: Table<GoalSnapshot, string>; // ⚡ NOVA TABELA

    constructor() {
        super("APMLiteDB");

        // Definição do Schema (Version 1)
        // Os campos após a vírgula são índices para buscas rápidas
        this.version(1).stores({
            wallets: "id, name, type, status, createdAt",
            assets: "id, walletId, type, symbol, createdAt",
            transactions: "id, walletId, type, status, date",
            goals: "id, status, deadline, createdAt",
        });

        // ⚡ Versão 2: Adiciona a nova tabela de movimentações de assets
        this.version(2).stores({
            assetMovements: 'id, assetId, assetSymbol, walletId, actionType, date',
        });

        //  Versão 3: Adiciona a tabela de snapshots de objetivos
        this.version(3).stores({
            goalSnapshots: 'id, goalId, archivedAt, percentage',
        });
    }
}

export const db = new APMDatabase();

// Helper para debug em ambiente de desenvolvimento (DEV)
if (import.meta.env.DEV) {
    window.db = db;
    console.log("💾 Database instance available safely at window.db");
}