import { APP_VERSION, downloadFile } from "./utils";
import { db } from "../database/db";

export const BACKUP_TABLES = [
  "wallets",
  "transactions",
  "assets",
  "assetPositions",
  "assetMovements",
  "goals",
  "sites",
  "siteMovements",
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export interface BackupPayload {
  app: string;
  appVersion: string;
  exportedAt: string;
  data: Record<BackupTableName, unknown[]>;
}

export function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.app !== "APM Lite") return false;
  if (typeof record.appVersion !== "string") return false;
  if (typeof record.exportedAt !== "string") return false;
  if (!record.data || typeof record.data !== "object") return false;

  const data = record.data as Record<string, unknown>;
  return BACKUP_TABLES.every((table) => Array.isArray(data[table]));
}

export async function exportBackup(): Promise<BackupPayload> {
  const [wallets, transactions, assets, assetPositions, assetMovements, goals, sites, siteMovements] =
    await Promise.all([
      db.wallets.toArray(),
      db.transactions.toArray(),
      db.assets.toArray(),
      db.assetPositions.toArray(),
      db.assetMovements.toArray(),
      db.goals.toArray(),
      db.sites.toArray(),
      db.siteMovements.toArray(),
    ]);

  return {
    app: "APM Lite",
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      wallets,
      transactions,
      assets,
      assetPositions,
      assetMovements,
      goals,
      sites,
      siteMovements,
    },
  };
}

export function downloadBackup(payload: BackupPayload): void {
  const date = new Date(payload.exportedAt);
  const filename = `apm-lite-backup-${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.json`;

  downloadFile(JSON.stringify(payload, null, 2), filename, "application/json");
}

export function parseBackup(text: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not a valid JSON file.");
  }

  if (!isBackupPayload(parsed)) {
    throw new Error("The selected file is not a valid APM Lite backup.");
  }

  return parsed;
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(BACKUP_TABLES.map((table) => db.table(table).clear()));
    await Promise.all(
      BACKUP_TABLES.map((table) => {
        const rows = payload.data[table];
        if (rows.length === 0) return Promise.resolve();
        return db.table(table).bulkPut(rows as never[]);
      }),
    );
  });
}