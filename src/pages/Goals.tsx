// src/pages/Goals.tsx (refatorado - corrigido)
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useGoals } from '../hooks/useGoals';
import { useGoalMetrics } from '../hooks/useGoalMetrics';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, cn } from '../lib/utils';
import {
    Plus, List, RotateCcw, Target, TrendingUp,
    Hourglass, Trophy, Flame, CheckCircle2, XCircle, MinusCircle
} from 'lucide-react';
import { DailyGoalsTable } from '../components/modules/DailyGoalsTable';
import { RecentGoalActivity } from '../components/modules/RecentGoalActivity';
import { NewGoalModal } from '../components/modals/NewGoalModal';
import { GoalListModal } from '../components/modals/GoalListModal';
import { GoalHistoryDrawer } from '../components/modals/GoalHistoryDrawer';
import { ResetWeekDialog } from '../components/modals/ResetWeekDialog';
import type { GoalSnapshot, Wallet } from '../types';
import { Helmet } from 'react-helmet-async';
import { db } from '../database/db';

export default function Goals() {
    const { toast } = useToast();
    const {
        activeGoal,
        archivedSnapshots: _archivedSnapshots, // ✅ Usar underscore para indicar que é intencionalmente não usado
        isLoading: goalsLoading,
        //createGoal,
        archiveGoal,
        deleteGoal,
        refresh: refreshGoals
    } = useGoals();

    // ✅ Usar refreshGoals em vez de handleRefreshData para recarregar dados
    const { metrics, isLoading: metricsLoading } = useGoalMetrics();

    // Dados auxiliares
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [hasProgress, setHasProgress] = useState(false);

    // Estados dos modais
    const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
    const [isGoalListModalOpen, setIsGoalListModalOpen] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [viewingSnapshot, setViewingSnapshot] = useState<GoalSnapshot | null>(null);
    const [isResetProcessing, setIsResetProcessing] = useState(false);

    // Carregar wallets para o modal de novo goal
    useEffect(() => {
        db.wallets.toArray().then(setWallets);
    }, []);

    // Verificar se há progresso (para o diálogo de reset)
    useEffect(() => {
        if (metrics?.goal) {
            import('../services/GoalService').then(({ GoalService }) => {
                GoalService.getRelevantTransactions(metrics.goal).then(txs => {
                    setHasProgress(txs.length > 0);
                });
            });
        } else {
            setHasProgress(false);
        }
    }, [metrics?.goal]);

    // ✅ Handlers simplificados - sem argumentos
    const handleNewGoalSuccess = async () => {
        setIsNewGoalModalOpen(false);
        toast({ type: 'success', title: 'Goal created', message: 'New goal is now active.' });
        await refreshGoals(); // ✅ Usar refreshGoals em vez de reload da página
    };

    const handleFinishWeek = async () => {
        setIsResetProcessing(true);
        try {
            await archiveGoal(); // ✅ Usar archiveGoal do hook
            setIsResetDialogOpen(false);
            toast({ type: 'success', title: 'Week finished', message: 'Progress archived successfully.' });
            await refreshGoals(); // ✅ Usar refreshGoals
        } catch (error) {
            toast({ type: 'error', title: 'Error', message: 'Failed to archive goal.' });
        } finally {
            setIsResetProcessing(false);
        }
    };

    const handleResetWithoutSaving = async () => {
        if (!activeGoal) return;

        setIsResetProcessing(true);
        try {
            await deleteGoal(activeGoal.id); // ✅ Usar deleteGoal do hook
            setIsResetDialogOpen(false);
            toast({ type: 'info', title: 'Week reset', message: 'Goal deleted without archiving.' });
            await refreshGoals(); // ✅ Usar refreshGoals
        } catch (error) {
            toast({ type: 'error', title: 'Error', message: 'Failed to reset goal.' });
        } finally {
            setIsResetProcessing(false);
        }
    };

    const isLoading = goalsLoading || metricsLoading;

    // --- Render ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted animate-pulse">Loading goal metrics...</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="space-y-6">
                <Helmet>
                    <title>Goals | Asset Portfolio Manager Lite</title>
                    <meta name="description" content="Track your weekly deposit goals across your wallets." />
                    <meta name="keywords" content="goals, weekly, deposit, track, portfolio" />
                </Helmet>
                <PageHeader
                    title="Goals"
                    subtitle="Track your weekly deposit goals across your wallets."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setIsGoalListModalOpen(true)}>
                                <List className="h-4 w-4 mr-2" /> Goal List
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setIsNewGoalModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> New Goal
                            </Button>
                        </div>
                    }
                />
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-surface/50">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Target className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">No Active Goal</h3>
                    <p className="text-text-muted text-center max-w-md mb-6">
                        You don't have any active weekly goals. Create a new goal to start tracking your deposit progress.
                    </p>
                    <Button variant="primary" size="md" onClick={() => setIsNewGoalModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create Your First Goal
                    </Button>
                </div>

                {/* Modais no empty state */}
                <NewGoalModal
                    isOpen={isNewGoalModalOpen}
                    onClose={() => setIsNewGoalModalOpen(false)}
                    wallets={wallets}
                    onSuccess={handleNewGoalSuccess} // ✅ Agora é () => void
                />
                <GoalListModal
                    isOpen={isGoalListModalOpen}
                    onClose={() => setIsGoalListModalOpen(false)}
                    activeGoal={null}
                    onSelectActive={refreshGoals} // ✅ Usar refreshGoals
                    onViewSnapshot={setViewingSnapshot}
                />
                <GoalHistoryDrawer
                    isOpen={!!viewingSnapshot}
                    onClose={() => setViewingSnapshot(null)}
                    snapshot={viewingSnapshot}
                />
            </div>
        );
    }

    const isCompleted = metrics.percentage >= 100;

    return (
        <>
            <div className="space-y-6">
                {/* 1. PageHeader */}
                <PageHeader
                    title="Goals"
                    subtitle={`Current Goal: ${metrics.goal.name} (${new Date(metrics.goal.startDate).toLocaleDateString()} - ${new Date(metrics.goal.endDate).toLocaleDateString()})`}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setIsGoalListModalOpen(true)}>
                                <List className="h-4 w-4 mr-2" /> Goal List
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setIsResetDialogOpen(true)}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Reset Week
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setIsNewGoalModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> New Goal
                            </Button>
                        </div>
                    }
                />

                {/* 2. Summary Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* ... Cards (mesmo código) ... */}
                    <div className="card p-5 flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Weekly Goal</span>
                            <div className="p-2 rounded-lg bg-surface-elevated text-text-secondary">
                                <Target className="h-5 w-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                            {formatCurrency(metrics.totalWeeklyGoal)}
                        </h3>
                    </div>

                    <div className="card p-5 flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Weekly Progress</span>
                            <div className="p-2 rounded-lg bg-success/10 text-success">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <CircularProgress
                                percentage={metrics.percentage}
                                size={56}
                                strokeWidth={5}
                                label={`${Math.round(metrics.percentage)}%`}
                                colorClass={isCompleted ? 'text-success' : 'text-primary'}
                            />
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                                    {formatCurrency(metrics.totalWeeklyProgress)}
                                </h3>
                                <p className="text-xs text-text-muted">achieved so far</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5 flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Remaining</span>
                            <div className={cn('p-2 rounded-lg', isCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Hourglass className="h-5 w-5" />}
                            </div>
                        </div>
                        <h3 className={cn('text-2xl font-bold tracking-tight', isCompleted ? 'text-success' : 'text-text-primary')}>
                            {isCompleted ? 'Completed' : formatCurrency(metrics.remaining)}
                        </h3>
                    </div>

                    <div className="card p-5 flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Best Wallet</span>
                            <div className="p-2 rounded-lg bg-surface-elevated text-warning">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </div>
                        {metrics.bestWallet ? (
                            <div>
                                <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
                                    {metrics.bestWallet.name}
                                </h3>
                                <p className="text-sm text-text-secondary mt-1">
                                    <span className="font-semibold text-text-primary">{metrics.bestWallet.percentage.toFixed(0)}%</span>
                                    <span className="mx-1">•</span>
                                    {formatCurrency(metrics.bestWallet.progress)} / {formatCurrency(metrics.bestWallet.goal)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted">No data yet</p>
                        )}
                    </div>

                    <div className="card p-5 flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Current Streak</span>
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                <Flame className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                                {metrics.streak} days
                            </h3>
                            <div className="flex items-center gap-1 mt-3">
                                {metrics.last7DaysStatus.map((status, i) => (
                                    <div key={i} title={status === 'met' ? 'Goal met' : status === 'missed' ? 'Goal missed' : 'Pending/No goal'}>
                                        {status === 'met' && <CheckCircle2 className="h-4 w-4 text-success" />}
                                        {status === 'missed' && <XCircle className="h-4 w-4 text-danger" />}
                                        {status === 'pending' && <MinusCircle className="h-4 w-4 text-text-muted" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted mt-1">Last 7 days</p>
                        </div>
                    </div>
                </section>

                {/* 3. Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DailyGoalsTable
                            goal={metrics.goal}
                            onRefresh={refreshGoals} // ✅ Usar refreshGoals
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <RecentGoalActivity goal={metrics.goal} />
                    </div>
                </div>
            </div>

            {/* Modais e Drawer */}
            <NewGoalModal
                isOpen={isNewGoalModalOpen}
                onClose={() => setIsNewGoalModalOpen(false)}
                wallets={wallets}
                onSuccess={handleNewGoalSuccess}
            />

            <GoalListModal
                isOpen={isGoalListModalOpen}
                onClose={() => setIsGoalListModalOpen(false)}
                activeGoal={metrics.goal}
                onSelectActive={refreshGoals} // ✅ Usar refreshGoals
                onViewSnapshot={setViewingSnapshot}
            />

            <GoalHistoryDrawer
                isOpen={!!viewingSnapshot}
                onClose={() => setViewingSnapshot(null)}
                snapshot={viewingSnapshot}
            />

            <ResetWeekDialog
                isOpen={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                hasProgress={hasProgress}
                onFinishWeek={handleFinishWeek}
                onResetWithoutSaving={handleResetWithoutSaving}
                isProcessing={isResetProcessing}
            />
        </>
    );
}