import { useEffect, useState } from 'react';
import type { Goal, Transaction, GoalProgressStatus } from '../../types';
import { GoalService, getRotatedDays, getDayLabel, getStatus } from '../../services/GoalService';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Archive, CheckCircle2 } from 'lucide-react';

export interface DailyGoalsTableProps {
    goal: Goal;
    onRefresh: () => void;
}

const STATUS_COLORS: Record<GoalProgressStatus, string> = {
    'Not Started': 'bg-surface-elevated text-text-muted',
    'Getting Started': 'bg-blue-500/10 text-blue-500',
    'Behind': 'bg-warning/10 text-warning',
    'On Track': 'bg-primary/10 text-primary',
    'Excellent': 'bg-success/10 text-success',
    'Completed': 'bg-success/10 text-success font-semibold',
};

export function DailyGoalsTable({ goal, onRefresh }: DailyGoalsTableProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isArchiving, setIsArchiving] = useState(false);
    const rotatedDays = getRotatedDays();

    useEffect(() => {
        GoalService.getRelevantTransactions(goal).then(setTransactions);
    }, [goal]);

    const progress = GoalService.calculateProgress(goal, transactions);

    const handleFinishWeek = async () => {
        // Nota: Na fase 6.4.5, isso será substituído pelo ResetWeekDialog completo.
        // Por enquanto, usamos um confirm simples para evitar cliques acidentais.
        if (window.confirm('Finish this goal? The current progress will be archived and become read-only.')) {
            setIsArchiving(true);
            try {
                await GoalService.archiveGoal(goal);
                onRefresh();
            } catch (error) {
                console.error('Failed to archive goal', error);
            } finally {
                setIsArchiving(false);
            }
        }
    };

    // Calcular totais para a linha de rodapé
    const totalCurrent = progress.walletProgress.reduce((sum, w) => sum + w.weeklyProgress, 0);
    const totalGoal = progress.walletProgress.reduce((sum, w) => sum + w.weeklyGoal, 0);
    const totalPercentage = totalGoal > 0 ? (totalCurrent / totalGoal) * 100 : 0;

    return (
        <div className="card flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">Daily Goals by Wallet</h3>
                    <p className="text-sm text-text-muted">Current Goal: <span className="font-medium text-text-primary">{goal.name}</span></p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFinishWeek}
                    disabled={isArchiving}
                >
                    <Archive className="h-4 w-4 mr-2" />
                    {isArchiving ? 'Archiving...' : 'Finish Week'}
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full min-w-200">
                    <thead>
                        <tr className="border-b border-border bg-surface-elevated/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider sticky left-0 bg-surface-elevated/50 z-10">Wallet</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Weekly Goal</th>
                            {rotatedDays.map((day) => (
                                <th key={day} className="px-2 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider min-w-[60px]">
                                    {getDayLabel(day)}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Current</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Progress</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {goal.wallets.map((wallet) => {
            const dailyProgressForWallet = (day: string) =>
                GoalService.getDailyProgress(transactions, wallet.walletId, day as any);

                            return (
                                <tr key={wallet.walletId} className="hover:bg-surface-elevated/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-text-primary sticky left-0 bg-background z-10">
                                        {wallet.walletName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary text-right font-mono">
                                        {formatCurrency(wallet.weeklyGoal)}
                                    </td>
                                    {rotatedDays.map((day) => {
                                        const amount = dailyProgressForWallet(day);
                                        const dailyGoal = wallet.dailyGoals[day] || 0;
                                        const isMet = amount >= dailyGoal && dailyGoal > 0;

                                        return (
                                            <td key={day} className="px-2 py-3 text-center">
                                                <span className={cn(
                                                    "text-sm font-mono",
                                                    isMet ? "text-success font-semibold" : "text-text-secondary"
                                                )}>
                                                    {amount > 0 ? formatCurrency(amount) : '-'}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-sm font-semibold text-text-primary text-right font-mono">
                                        {formatCurrency(progress.walletProgress.find(w => w.walletId === wallet.walletId)?.weeklyProgress || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-secondary text-right font-mono">
                                        {progress.walletProgress.find(w => w.walletId === wallet.walletId)?.percentage.toFixed(0)}%
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            STATUS_COLORS[progress.walletProgress.find(w => w.walletId === wallet.walletId)?.status || 'Not Started']
                                        )}>
                                            {progress.walletProgress.find(w => w.walletId === wallet.walletId)?.status === 'Completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {progress.walletProgress.find(w => w.walletId === wallet.walletId)?.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Total Row */}
                        <tr className="bg-surface-elevated/50 font-semibold border-t-2 border-border">
                            <td className="px-4 py-3 text-sm text-text-primary sticky left-0 bg-surface-elevated/50 z-10">
                                Total
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                                {formatCurrency(totalGoal)}
                            </td>
                            {rotatedDays.map((day) => {
                                // Soma do dia entre todas as wallets
                                const dayTotal = goal.wallets.reduce((sum, w) => {
                                    return sum + GoalService.getDailyProgress(transactions, w.walletId, day);
                                }, 0);
                                return (
                                    <td key={`total-${day}`} className="px-2 py-3 text-center text-sm text-text-primary font-mono">
                                        {dayTotal > 0 ? formatCurrency(dayTotal) : '-'}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                                {formatCurrency(totalCurrent)}
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                                {totalPercentage.toFixed(0)}%
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    STATUS_COLORS[getStatus(totalPercentage)]
                                )}>
                                    {getStatus(totalPercentage) === 'Completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    {getStatus(totalPercentage)}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}