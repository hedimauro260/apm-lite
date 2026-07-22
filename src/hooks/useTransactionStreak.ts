// src/hooks/useTransactionStreak.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { format, subDays } from 'date-fns';

export interface UseTransactionStreakReturn {
    streak: number;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

// ✅ Tipos permitidos para streak (padrão: apenas 'deposit')
const DEFAULT_STREAK_TYPES = ['deposit'] as const;

export function useTransactionStreak(
    includeTypes: string[] = DEFAULT_STREAK_TYPES as unknown as string[]
): UseTransactionStreakReturn {
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const calculateStreak = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const transactions = await db.transactions.toArray();

            // ✅ Filtrar apenas os tipos permitidos
            const filtered = transactions.filter(tx => includeTypes.includes(tx.type));

            if (filtered.length === 0) {
                setStreak(0);
                return;
            }

            // 1. Extrair datas únicas
            const uniqueDates = [...new Set(filtered.map(t => format(new Date(t.date), 'yyyy-MM-dd')))];

            // 2. Ordenar datas
            uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = format(today, 'yyyy-MM-dd');

            const yesterday = subDays(today, 1);
            const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

            // 3. Verifica se a última transação foi hoje ou ontem
            const lastDate = uniqueDates[0];
            if (lastDate !== todayStr && lastDate !== yesterdayStr) {
                setStreak(0);
                return;
            }

            // 4. Verificar dias
            const hasToday = uniqueDates.includes(todayStr);
            const hasYesterday = uniqueDates.includes(yesterdayStr);

            if (!hasToday && !hasYesterday) {
                setStreak(0);
                return;
            }

            // 5. Contar a streak
            let streakCount = 0;
            let checkDate = hasToday ? new Date(todayStr) : new Date(yesterdayStr);

            for (let i = 0; i < 365; i++) {
                const dateStr = format(checkDate, 'yyyy-MM-dd');

                if (uniqueDates.includes(dateStr)) {
                    streakCount++;
                    checkDate = subDays(checkDate, 1);
                } else {
                    break;
                }
            }

            setStreak(streakCount);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to calculate streak';
            setError(message);
            console.error('Streak calculation error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [includeTypes]);

    useEffect(() => {
        calculateStreak();
    }, [calculateStreak]);

    return {
        streak,
        isLoading,
        error,
        refresh: calculateStreak,
    };
}