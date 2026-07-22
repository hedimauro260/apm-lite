/**
 * Backup & Restore - Export/Import atômico de dados
 * 
 * SEGURANÇA:
 * - exportData(): Gera JSON com TODAS as tabelas do Dexie
 * - importData(): Usa db.transaction('rw', ...) para atomicidade
 *   → Se qualquer etapa falhar, NENHUM dado é alterado (rollback)
 * 
 * FORMATO DO ARQUIVO:
 * {
 *   version: "1.0",
 *   exportDate: "2026-07-22T...",
 *   wallets: [...],
 *   assets: [...],
 *   transactions: [...],
 *   goals: [...],
 *   goalSnapshots: [...],
 *   assetMovements: [...]
 * }
 * 
 * @warning IMPORT SUBSTITUI TODOS OS DADOS ATUAIS
 */

import { db } from '../database/db';

export interface BackupData {
    version: string;
    exportDate: string;
    wallets: any[];
    assets: any[];
    transactions: any[];
    goals: any[];
    goalSnapshots: any[];
    assetMovements: any[];
}

/**
 * Exporta todos os dados do banco para um arquivo JSON.
 */
export async function exportData(): Promise<void> {
    try {
        const data: BackupData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            wallets: await db.wallets.toArray(),
            assets: await db.assets.toArray(),
            transactions: await db.transactions.toArray(),
            goals: await db.goals.toArray(),
            goalSnapshots: await db.goalSnapshots.toArray(),
            assetMovements: await db.assetMovements.toArray(),
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `apm-lite-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export failed:', error);
        throw new Error('Failed to export data. Please try again.');
    }
}

/**
 * Importa dados de um arquivo JSON, substituindo tudo de forma atômica.
 */
export async function importData(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const data: BackupData = JSON.parse(text);

                // Validação básica da estrutura
                if (!data.version || !Array.isArray(data.wallets)) {
                    throw new Error('Invalid backup file format. Please select a valid APM Lite backup.');
                }

                // Transação atômica: limpa e restaura. Se falhar em qualquer ponto, nada é alterado.
                await db.transaction(
                    'rw',
                    [
                        db.wallets,
                        db.assets,
                        db.transactions,
                        db.goals,
                        db.goalSnapshots,
                        db.assetMovements,
                    ],
                    async () => {
                        await db.wallets.clear();
                        await db.assets.clear();
                        await db.transactions.clear();
                        await db.goals.clear();
                        await db.goalSnapshots.clear();
                        await db.assetMovements.clear();

                        if (data.wallets.length) await db.wallets.bulkAdd(data.wallets);
                        if (data.assets.length) await db.assets.bulkAdd(data.assets);
                        if (data.transactions.length) await db.transactions.bulkAdd(data.transactions);
                        if (data.goals.length) await db.goals.bulkAdd(data.goals);
                        if (data.goalSnapshots.length) await db.goalSnapshots.bulkAdd(data.goalSnapshots);
                        if (data.assetMovements.length) await db.assetMovements.bulkAdd(data.assetMovements);
                    }
                );

                resolve();
            } catch (error) {
                console.error('Import failed:', error);
                reject(error instanceof Error ? error : new Error('Failed to import data. The file may be corrupted.'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read the file.'));
        reader.readAsText(file);
    });
}