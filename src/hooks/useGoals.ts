import { useState, useEffect, useCallback } from 'react';
import { GoalService } from '../services/GoalService';
import type { Goal, GoalSnapshot } from '../types';
import { useToast } from '../components/ui/Toast';

export interface CreateGoalData {
    name: string;
    startDate: string;
    endDate: string;
    totalWeeklyGoal: number;
    wallets: Array<{
        walletId: string;
        walletName: string;
        weeklyGoal: number;
        dailyGoals: {
            mon: number;
            tue: number;
            wed: number;
            thu: number;
            fri: number;
            sat: number;
            sun: number;
        };
    }>;
}

export interface UseGoalsReturn {
    activeGoal: Goal | null;
    archivedSnapshots: GoalSnapshot[];
    isLoading: boolean;
    error: string | null;
    createGoal: (data: CreateGoalData) => Promise<void>;
    archiveGoal: () => Promise<void>;
    deleteGoal: (goalId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
    const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
    const [archivedSnapshots, setArchivedSnapshots] = useState<GoalSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [goal, snapshots] = await Promise.all([
                GoalService.getActiveGoal(),
                GoalService.getArchivedSnapshots(),
            ]);

            setActiveGoal(goal);
            setArchivedSnapshots(snapshots);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load goals';
            setError(message);
            console.error('Error loading goals:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Create Goal
    const createGoal = async (data: CreateGoalData) => {
        try {
            await GoalService.createGoal(data);
            await loadData();

            toast({
                type: 'success',
                title: 'Goal created',
                message: `New goal "${data.name}" is now active.`,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create goal';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Archive Goal (Finish Week)
    const archiveGoal = async () => {
        try {
            if (!activeGoal) {
                toast({ type: 'error', title: 'Error', message: 'No active goal to archive.' });
                return;
            }

            await GoalService.archiveGoal(activeGoal);
            await loadData();

            toast({
                type: 'success',
                title: 'Week finished',
                message: 'Progress archived successfully.',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to archive goal';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Delete Goal (Reset Without Saving)
    const deleteGoal = async (goalId: string) => {
        try {
            await GoalService.deleteGoal(goalId);
            await loadData();

            toast({
                type: 'info',
                title: 'Goal deleted',
                message: 'Goal removed without archiving.',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete goal';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Refresh manual
    const refresh = async () => {
        await loadData();
    };

    return {
        activeGoal,
        archivedSnapshots,
        isLoading,
        error,
        createGoal,
        archiveGoal,
        deleteGoal,
        refresh,
    };
}