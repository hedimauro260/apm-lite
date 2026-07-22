import { useEffect, useState } from 'react';
import type { Goal, Transaction } from '../../types';
import { GoalService } from '../../services/GoalService';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';

export interface RecentGoalActivityProps {
    goal: Goal;
}

export function RecentGoalActivity({ goal }: RecentGoalActivityProps) {
    const [activities, setActivities] = useState<Transaction[]>([]);

    useEffect(() => {
        GoalService.getRelevantTransactions(goal).then((txs) => {
            // Ordenar por data, mais recente primeiro, e pegar as últimas 8
            const sorted = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setActivities(sorted.slice(0, 8));
        });
    }, [goal]);

    if (activities.length === 0) {
        return (
            <div className="card p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <p className="text-sm text-text-muted text-center">No deposit activity recorded for this goal yet.</p>
            </div>
        );
    }

    return (
        <div className="card p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Goal Activity</h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {activities.map((tx) => {
                    const dateStr = format(new Date(tx.date), 'MMM dd');
                    return (
                        <div key={tx.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className="p-2 rounded-full bg-success/10 text-success shrink-0 mt-1">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        Deposit synced
                                    </p>
                                    <span className="text-sm font-semibold text-success font-mono">
                                        +{formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <span>{tx.description || 'Wallet Deposit'}</span>
                                    <span>•</span>
                                    <span>{dateStr}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}