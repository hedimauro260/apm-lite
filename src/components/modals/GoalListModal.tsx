import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GoalService } from '../../services/GoalService';
import type { Goal, GoalSnapshot, GoalProgressStatus } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Target, Eye } from 'lucide-react';

export interface GoalListModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeGoal: Goal | null;
    onSelectActive: () => void;
    onViewSnapshot: (snapshot: GoalSnapshot) => void;
}

const STATUS_STYLES: Record<GoalProgressStatus, string> = {
    'Not Started': 'bg-surface-elevated text-text-muted',
    'Getting Started': 'bg-blue-500/10 text-blue-500',
    'Behind': 'bg-warning/10 text-warning',
    'On Track': 'bg-primary/10 text-primary',
    'Excellent': 'bg-success/10 text-success',
    'Completed': 'bg-success/10 text-success',
};

export function GoalListModal({
    isOpen,
    onClose,
    activeGoal,
    onSelectActive,
    onViewSnapshot,
}: GoalListModalProps) {
    const [snapshots, setSnapshots] = useState<GoalSnapshot[]>([]);

    useEffect(() => {
        if (isOpen) {
            GoalService.getArchivedSnapshots().then(setSnapshots);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Goal List" size="md">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Seção Current */}
                <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Current
                    </h4>
                    {activeGoal ? (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h5 className="font-semibold text-text-primary">{activeGoal.name}</h5>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {format(new Date(activeGoal.startDate), 'MMM dd')} - {format(new Date(activeGoal.endDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
                                <div>
                                    <p className="text-xs text-text-muted">Weekly Goal</p>
                                    <p className="text-sm font-bold text-text-primary">{formatCurrency(activeGoal.totalWeeklyGoal)}</p>
                                </div>
                                <Button variant="primary" size="sm" onClick={() => { onSelectActive(); onClose(); }}>
                                    <Target className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted italic">No active goal</p>
                    )}
                </div>

                {/* Seção Archived */}
                <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Archived
                    </h4>
                    {snapshots.length === 0 ? (
                        <p className="text-sm text-text-muted italic">No archived goals yet</p>
                    ) : (
                        <div className="space-y-2">
                            {snapshots.map(snapshot => (
                                <div
                                    key={snapshot.id}
                                    className="p-4 bg-surface-elevated border border-border rounded-lg hover:border-border-light transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h5 className="font-semibold text-text-primary">{snapshot.goalName}</h5>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {format(new Date(snapshot.startDate), 'MMM dd')} - {format(new Date(snapshot.endDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-xs font-medium',
                                            STATUS_STYLES[snapshot.bestWallet ? 'On Track' : 'Not Started']
                                        )}>
                                            {snapshot.percentage >= 100 ? 'Completed' : `${snapshot.percentage.toFixed(0)}%`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-xs text-text-muted">Goal</p>
                                                <p className="text-sm font-semibold text-text-primary">{formatCurrency(snapshot.totalWeeklyGoal)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted">Achieved</p>
                                                <p className="text-sm font-semibold text-success">{formatCurrency(snapshot.totalWeeklyProgress)}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => onViewSnapshot(snapshot)}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button type="button" variant="ghost" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}