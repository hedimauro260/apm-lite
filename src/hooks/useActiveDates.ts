// src/hooks/useActiveDates.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { format } from 'date-fns';

export function useActiveDates() {
    const [activeDates, setActiveDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadActiveDates = useCallback(async () => {
        try {
            setIsLoading(true);
            const transactions = await db.transactions.toArray();

            // ✅ Apenas depósitos
            const depositDates = transactions
                .filter(tx => tx.type === 'deposit')
                .map(tx => format(new Date(tx.date), 'yyyy-MM-dd'));

            // Remover duplicatas
            const uniqueDates = [...new Set(depositDates)];
            setActiveDates(uniqueDates);
        } catch (error) {
            console.error('Error loading active dates:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActiveDates();
    }, [loadActiveDates]);

    return {
        activeDates,
        isLoading,
        refresh: loadActiveDates,
    };
}