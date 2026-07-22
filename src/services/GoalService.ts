// src/services/GoalService.ts
/**
 * GoalService - Camada de lógica de negócio para Goals
 * 
 * RESPONSABILIDADES:
 * - Calcular progresso de metas semanais
 * - Calcular streak de dias consecutivos
 * - Gerar snapshots imutáveis ao arquivar
 * - Filtrar transações relevantes (deposit + website preenchido)
 * 
 * REGRA DE OURO:
 * Snapshots (GoalSnapshot) são FOTOGRAFIAS ETERNAS.
 * Nenhuma função deste serviço modifica ou recalcula snapshots existentes.
 * 
 * @example
 * const progress = GoalService.calculateProgress(goal, transactions);
 * await GoalService.archiveGoal(goal); // Cria snapshot + arquiva
 */

import { db } from '../database/db';
import type {
    Goal,
    GoalSnapshot,
    Transaction,
    GoalProgressStatus,
    DayOfWeek,
} from '../types';
import { format, subDays, isSameDay } from 'date-fns';

// ============================================================
// UTILS INTERNOS
// ============================================================

const DAYS_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_LABELS: Record<DayOfWeek, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
};

/**
 * Retorna os dias da semana rotacionados, começando pelo dia atual.
 * Ex: Se hoje é Quinta, retorna ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed']
 */
export function getRotatedDays(): DayOfWeek[] {
    const todayKey = format(new Date(), 'EEE').toLowerCase() as DayOfWeek;
    const todayIndex = DAYS_ORDER.indexOf(todayKey);
    if (todayIndex === -1) return DAYS_ORDER;
    return [...DAYS_ORDER.slice(todayIndex), ...DAYS_ORDER.slice(0, todayIndex)];
}

export function getDayLabel(day: DayOfWeek): string {
    return DAY_LABELS[day];
}

/**
 * Retorna o status de progresso baseado na porcentagem (6 níveis).
 */
export function getStatus(percentage: number): GoalProgressStatus {
    if (percentage >= 100) return 'Completed';
    if (percentage >= 81) return 'Excellent';
    if (percentage >= 61) return 'On Track';
    if (percentage >= 41) return 'Behind';
    if (percentage >= 21) return 'Getting Started';
    return 'Not Started';
}

/**
 * Converte uma data em chave de dia da semana ('mon', 'tue', etc.)
 */
export function getDayKeyFromDate(date: Date): DayOfWeek {
    return format(date, 'EEE').toLowerCase() as DayOfWeek;
}

// ============================================================
// GOAL SERVICE
// ============================================================

export const GoalService = {
    // ----------------------------------------------------------
    // QUERIES
    // ----------------------------------------------------------

    /**
     * Retorna o objetivo ativo (se houver).
     */
    async getActiveGoal(): Promise<Goal | null> {
        const goals = await db.goals.where('status').equals('active').toArray();
        return goals.length > 0 ? goals[0] : null;
    },

    /**
     * Retorna todos os objetivos (ativos e arquivados).
     */
    async getAllGoals(): Promise<Goal[]> {
        return await db.goals.orderBy('createdAt').reverse().toArray();
    },

    /**
     * Retorna todos os snapshots arquivados, ordenados do mais recente.
     */
    async getArchivedSnapshots(): Promise<GoalSnapshot[]> {
        return await db.goalSnapshots.orderBy('archivedAt').reverse().toArray();
    },

    /**
     * Retorna o snapshot de um goal específico.
     */
    async getSnapshotByGoalId(goalId: string): Promise<GoalSnapshot | null> {
        const snapshots = await db.goalSnapshots.where('goalId').equals(goalId).toArray();
        return snapshots.length > 0 ? snapshots[0] : null;
    },

    // ----------------------------------------------------------
    // FILTRAGEM DE TRANSAÇÕES RELEVANTES
    // ----------------------------------------------------------

    /**
     * Filtra transações que contam para o progresso de um objetivo.
     *
     * Regras:
     *  - type === 'deposit'
     *  - website preenchido (não vazio)
     *  - dentro do período do goal
     *  - walletId pertence às wallets monitoradas
     */
    async getRelevantTransactions(goal: Goal): Promise<Transaction[]> {
        // ✅ Verificar se goal.wallets existe
        if (!goal.wallets || !Array.isArray(goal.wallets)) {
            console.warn('Goal wallets is undefined or not an array:', goal);
            return [];
        }

        const allTxs = await db.transactions.toArray();
        const walletIds = new Set(goal.wallets.map((w) => w.walletId));
        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);
        end.setHours(23, 59, 59, 999);

        return allTxs.filter((tx) => {
            if (tx.type !== 'deposit') return false;
            if (!tx.website || tx.website.trim() === '') return false;
            if (!walletIds.has(tx.walletId)) return false;
            const txDate = new Date(tx.date);
            return txDate >= start && txDate <= end;
        });
    },

    // ----------------------------------------------------------
    // CÁLCULOS
    // ----------------------------------------------------------

    /**
     * Calcula o progresso total e por wallet.
     */
    calculateProgress(goal: Goal, transactions: Transaction[]) {
        const walletProgress = goal.wallets.map((wallet) => {
            const walletTxs = transactions.filter((tx) => tx.walletId === wallet.walletId);
            const progress = walletTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const percentage =
                wallet.weeklyGoal > 0 ? (progress / wallet.weeklyGoal) * 100 : 0;

            return {
                walletId: wallet.walletId,
                walletName: wallet.walletName,
                weeklyGoal: wallet.weeklyGoal,
                weeklyProgress: progress,
                percentage: Math.min(percentage, 100),
                status: getStatus(percentage),
            };
        });

        const totalWeeklyGoal = goal.wallets.reduce((sum, w) => sum + w.weeklyGoal, 0);
        const totalWeeklyProgress = walletProgress.reduce(
            (sum, w) => sum + w.weeklyProgress,
            0
        );
        const totalPercentage =
            totalWeeklyGoal > 0 ? (totalWeeklyProgress / totalWeeklyGoal) * 100 : 0;

        return {
            walletProgress,
            totalWeeklyGoal,
            totalWeeklyProgress,
            totalPercentage: Math.min(totalPercentage, 100),
            remaining: Math.max(totalWeeklyGoal - totalWeeklyProgress, 0),
            status: getStatus(totalPercentage),
        };
    },

    /**
     * Retorna a meta diária total (soma de todas as wallets) para um dia da semana.
     */
    getDailyGoalForDay(goal: Goal, day: DayOfWeek): number {
        return goal.wallets.reduce((sum, w) => {
            return sum + (w.dailyGoals[day] || 0);
        }, 0);
    },

    /**
     * Calcula o progresso de uma wallet específica em um dia da semana.
     * 
     * ✅ NOVA FUNÇÃO ADICIONADA
     */
    getDailyProgress(transactions: Transaction[], walletId: string, day: DayOfWeek): number {
        return transactions
            .filter((tx) => {
                if (tx.walletId !== walletId) return false;
                const txDay = format(new Date(tx.date), 'EEE').toLowerCase() as DayOfWeek;
                return txDay === day;
            })
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    },

    /**
     * Calcula a streak atual (dias consecutivos com meta diária atingida).
     *
     * Regra: conta de hoje para trás. Se hoje ainda não atingiu, não quebra
     * a streak dos dias anteriores (o dia ainda está em andamento).
     */
    calculateStreak(goal: Goal, transactions: Transaction[]): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDay = new Date(today);

        for (let i = 0; i < 30; i++) {
            const dayKey = getDayKeyFromDate(currentDay);
            const dayGoal = this.getDailyGoalForDay(goal, dayKey);

            // Se não há meta para este dia (ex: domingo com meta 0), pula
            if (dayGoal === 0) {
                currentDay = subDays(currentDay, 1);
                continue;
            }

            const dayTxs = transactions.filter((tx) => {
                const txDate = new Date(tx.date);
                txDate.setHours(0, 0, 0, 0);
                return isSameDay(txDate, currentDay);
            });

            const dayProgress = dayTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

            if (dayProgress >= dayGoal) {
                streak++;
            } else {
                // Se é hoje (i === 0) e ainda não atingiu, não quebra a streak
                // Continua verificando dias anteriores
                if (i > 0) {
                    break;
                }
            }

            currentDay = subDays(currentDay, 1);
        }

        return streak;
    },

    /**
     * Retorna a wallet com maior percentual de conclusão.
     */
    calculateBestWallet(goal: Goal, transactions: Transaction[]) {
        const progress = this.calculateProgress(goal, transactions);
        if (progress.walletProgress.length === 0) return null;

        const best = progress.walletProgress.reduce((prev, current) => {
            return current.percentage > prev.percentage ? current : prev;
        });

        return {
            walletName: best.walletName,
            percentage: best.percentage,
            progress: best.weeklyProgress,
            goal: best.weeklyGoal,
        };
    },

    // ----------------------------------------------------------
    // AÇÕES
    // ----------------------------------------------------------

    /**
     * Arquiva o goal e cria um snapshot imutável.
     *
     * Regra de Ouro: O snapshot é uma fotografia eterna.
     * Nenhuma edição futura de transações alterará este registro.
     */
    async archiveGoal(goal: Goal): Promise<GoalSnapshot> {
        const transactions = await this.getRelevantTransactions(goal);
        const progress = this.calculateProgress(goal, transactions);
        const streak = this.calculateStreak(goal, transactions);
        const bestWallet = this.calculateBestWallet(goal, transactions);

        const snapshot: GoalSnapshot = {
            id: crypto.randomUUID(),
            goalId: goal.id,
            goalName: goal.name,
            archivedAt: new Date().toISOString(),
            startDate: goal.startDate,
            endDate: goal.endDate,
            totalWeeklyGoal: progress.totalWeeklyGoal,
            totalWeeklyProgress: progress.totalWeeklyProgress,
            remaining: progress.remaining,
            percentage: progress.totalPercentage,
            streak,
            bestWallet,
            walletProgress: progress.walletProgress.map((w) => ({
                walletId: w.walletId,
                walletName: w.walletName,
                weeklyGoal: w.weeklyGoal,
                weeklyProgress: w.weeklyProgress,
                percentage: w.percentage,
                status: w.status,
            })),
        };

        // Transação atômica: arquiva o goal E salva o snapshot
        await db.transaction('rw', db.goals, db.goalSnapshots, async () => {
            await db.goals.update(goal.id, {
                status: 'archived',
                updatedAt: new Date().toISOString(),
            });
            await db.goalSnapshots.add(snapshot);
        });

        return snapshot;
    },

    /**
     * Cria um novo objetivo ativo.
     * Se já existir um ativo, arquiva-o automaticamente.
     */
    async createGoal(goalData: Omit<Goal, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
        // Verifica se já existe um goal ativo
        const activeGoal = await this.getActiveGoal();
        if (activeGoal) {
            await this.archiveGoal(activeGoal);
        }

        const newGoal: Goal = {
            ...goalData,
            id: crypto.randomUUID(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.goals.add(newGoal);
        return newGoal;
    },

    /**
     * Atualiza um goal existente (apenas se estiver ativo).
     */
    async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
        const goal = await db.goals.get(goalId);
        if (!goal) throw new Error('Goal not found');
        if (goal.status !== 'active') {
            throw new Error('Cannot update an archived goal');
        }

        await db.goals.update(goalId, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    },

    /**
     * Deleta um goal e seu snapshot associado (se existir).
     */
    async deleteGoal(goalId: string): Promise<void> {
        await db.transaction('rw', db.goals, db.goalSnapshots, async () => {
            await db.goals.delete(goalId);
            await db.goalSnapshots.where('goalId').equals(goalId).delete();
        });
    },
};

// ============================================================
// EXPORTAÇÃO PARA COMPATIBILIDADE
// ============================================================

export default GoalService;