import Dexie, { type Table } from "dexie";
import type { Wallet, Transaction, AssetEntity, AssetPosition, AssetMovement, Goal, Site, SiteMovement } from "../types";

// ✅ Corrigir: Window (maiúsculo) em vez de window (minúsculo)
declare global {
  interface Window {
    db?: APMDatabase;
  }
}

// Configuração do banco de dados
class APMDatabase extends Dexie {
  // Tabelas
  wallets!: Table<Wallet>;
  transactions!: Table<Transaction, string>;
  assets!: Table<AssetEntity, string>;
  assetPositions!: Table<AssetPosition, string>;
  assetMovements!: Table<AssetMovement, string>;
  goals!: Table<Goal, string>;
  sites!: Table<Site, string>;
  siteMovements!: Table<SiteMovement, string>;

  constructor() {
    super("APMLite_DB");

    // Schema unificado em uma única versão
    // Os campos após a vírgula são índices para buscas rápidas
    this.version(6)
      .stores({
        wallets: "&id, name, type, status, createdAt",
        transactions: "&id, walletId, relatedWalletId, date, type, status, createdAt",
        assets: "&id, symbol, type, name, createdAt",
        assetPositions: "&id, assetId, walletId, createdAt",
        assetMovements: "&id, assetId, walletId, actionType, date, createdAt",
        goals: "&id, status, startDate, endDate, createdAt",
        sites: "&id, name, status, createdAt",
        siteMovements: "&id, siteId, type, date, createdAt",
      })
      .upgrade(async () => {
        // Em desenvolvimento: zera todas as tabelas ao migrar de versões antigas
        await Promise.all([
          this.table("wallets").clear(),
          this.table("transactions").clear(),
          this.table("assets").clear(),
          this.table("assetPositions").clear(),
          this.table("assetMovements").clear(),
          this.table("goals").clear(),
          this.table("sites").clear(),
          this.table("siteMovements").clear(),
        ]);
      });
  }
}

// ✅ Exportar a instância diretamente
export const db = new APMDatabase();

// Helper para debug em ambiente de desenvolvimento (DEV)
if (import.meta.env.DEV) {
  window.db = db; // ✅ Agora funciona
  console.log("💾 Database instance available safely at window.db");
}
