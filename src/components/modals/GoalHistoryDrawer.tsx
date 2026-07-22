import { type GoalSnapshot } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { X, Target, Trophy, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';

export interface GoalHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    snapshot: GoalSnapshot | null;
}

const STATUS_STYLES: Record<string, string> = {
    'Not Started': 'bg-surface-elevated text-text-muted',
    'Getting Started': 'bg-blue-500/10 text-blue-500',
    'Behind': 'bg-warning/10 text-warning',
    'On Track': 'bg-primary/10 text-primary',
    'Excellent': 'bg-success/10 text-success',
    'Completed': 'bg-success/10 text-success',
};

export function GoalHistoryDrawer({ isOpen, onClose, snapshot }: GoalHistoryDrawerProps) {
    if (!snapshot) return null;

    const isCompleted = snapshot.percentage >= 100;

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    'fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">{snapshot.goalName}</h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            {format(new Date(snapshot.startDate), 'MMM dd')} - {format(new Date(snapshot.endDate), 'MMM dd, yyyy')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                        <span className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
                            isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        )}>
                            {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                            {isCompleted ? 'Completed' : `${snapshot.percentage.toFixed(1)}% Achieved`}
                        </span>
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-text-muted" />
                                <p className="text-xs text-text-muted uppercase tracking-wider">Weekly Goal</p>
                            </div>
                            <p className="text-xl font-bold text-text-primary">{formatCurrency(snapshot.totalWeeklyGoal)}</p>
                        </div>

                        <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-success" />
                                <p className="text-xs text-text-muted uppercase tracking-wider">Achieved</p>
                            </div>
                            <p className="text-xl font-bold text-success">{formatCurrency(snapshot.totalWeeklyProgress)}</p>
                        </div>

                        <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <p className="text-xs text-text-muted uppercase tracking-wider">Streak</p>
                            </div>
                            <p className="text-xl font-bold text-text-primary">{snapshot.streak} days</p>
                        </div>

                        <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-warning" />
                                <p className="text-xs text-text-muted uppercase tracking-wider">Best Wallet</p>
                            </div>
                            {snapshot.bestWallet ? (
                                <div>
                                    <p className="text-sm font-semibold text-text-primary truncate">{snapshot.bestWallet.walletName}</p>
                                    <p className="text-xs text-text-muted">{snapshot.bestWallet.percentage.toFixed(0)}%</p>
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted">-</p>
                            )}
                        </div>
                    </div>

                    {/* Wallet Progress List */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
                            Wallet Breakdown
                        </h3>
                        <div className="space-y-2">
                            {snapshot.walletProgress.map(wallet => (
                                <div
                                    key={wallet.walletId}
                                    className="p-3 bg-surface border border-border rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-text-primary">{wallet.walletName}</p>
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-xs font-medium',
                                            STATUS_STYLES[wallet.status]
                                        )}>
                                            {wallet.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-text-muted">
                                            {formatCurrency(wallet.weeklyProgress)} / {formatCurrency(wallet.weeklyGoal)}
                                        </span>
                                        <span className="font-semibold text-text-primary">{wallet.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                wallet.percentage >= 100 ? 'bg-success' :
                                                    wallet.percentage >= 61 ? 'bg-primary' :
                                                        wallet.percentage >= 41 ? 'bg-warning' : 'bg-text-muted'
                                            )}
                                            style={{ width: `${Math.min(wallet.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Archived At */}
                    <div className="pt-4 border-t border-border text-center">
                        <p className="text-xs text-text-muted">
                            Archived on {format(new Date(snapshot.archivedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}