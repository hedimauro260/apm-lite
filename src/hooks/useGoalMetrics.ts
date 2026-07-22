import { useEffect, useState } from 'react';
import { GoalService, getDayKeyFromDate } from '../services/GoalService';
import type { Goal, GoalProgressStatus } from '../types';
import { subDays, isSameDay } from 'date-fns';

export interface GoalMetrics {
    goal: Goal;
    totalWeeklyGoal: number;
    totalWeeklyProgress: number;
    remaining: number;
    percentage: number;
    status: GoalProgressStatus;
    bestWallet: { name: string; percentage: number; progress: number; goal: number } | null;
    streak: number;
    last7DaysStatus: ('met' | 'missed' | 'pending')[];
}

export function useGoalMetrics() {
    const [metrics, setMetrics] = useState<GoalMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const activeGoal = await GoalService.getActiveGoal();
                if (!activeGoal) {
                    setMetrics(null);
                    return;
                }

                const transactions = await GoalService.getRelevantTransactions(activeGoal);
                const progress = GoalService.calculateProgress(activeGoal, transactions);
                const streak = GoalService.calculateStreak(activeGoal, transactions);
                const bestWalletRaw = GoalService.calculateBestWallet(activeGoal, transactions);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const last7DaysStatus: ('met' | 'missed' | 'pending')[] = [];

                for (let i = 6; i >= 0; i--) {
                    const checkDate = subDays(today, i);
                    const dayKey = getDayKeyFromDate(checkDate);
                    const dayGoal = GoalService.getDailyGoalForDay(activeGoal, dayKey);

                    if (dayGoal === 0) {
                        last7DaysStatus.push('pending');
                        continue;
                    }

                    const dayTxs = transactions.filter((tx) => {
                        const txDate = new Date(tx.date);
                        txDate.setHours(0, 0, 0, 0);
                        return isSameDay(txDate, checkDate);
                    });

                    const dayProgress = dayTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

                    if (dayProgress >= dayGoal) {
                        last7DaysStatus.push('met');
                    } else if (i === 0) {
                        last7DaysStatus.push('pending');
                    } else {
                        last7DaysStatus.push('missed');
                    }
                }

                const bestWallet = bestWalletRaw ? {
                    name: bestWalletRaw.walletName,
                    percentage: bestWalletRaw.percentage,
                    progress: bestWalletRaw.progress,
                    goal: bestWalletRaw.goal,
                } : null;

                setMetrics({
                    goal: activeGoal,
                    totalWeeklyGoal: progress.totalWeeklyGoal,
                    totalWeeklyProgress: progress.totalWeeklyProgress,
                    remaining: progress.remaining,
                    percentage: progress.totalPercentage,
                    status: progress.status,
                    bestWallet,
                    streak,
                    last7DaysStatus,
                });
            } catch (error) {
                console.error('Error fetching goal metrics:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    return { metrics, isLoading };
}