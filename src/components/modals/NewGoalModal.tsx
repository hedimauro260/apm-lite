import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { type Wallet } from '../../types';
import { GoalService, getRotatedDays, getDayLabel } from '../../services/GoalService';
import { cn, formatCurrency } from '../../lib/utils';
import { type DailyGoals } from '../../types';
import { ChevronRight, ChevronLeft, Target, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

export interface NewGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    onSuccess: () => void;
}

type DistributionMode = 'same' | 'custom';

export function NewGoalModal({ isOpen, onClose, wallets, onSuccess }: NewGoalModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Etapa 1
    const [name, setName] = useState('');
    const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
    const [distributionMode, setDistributionMode] = useState<DistributionMode>('same');

    // Etapa 2
    const [weeklyGoalPerWallet, setWeeklyGoalPerWallet] = useState<Record<string, number>>({});
    const [customDailyPerWallet, setCustomDailyPerWallet] = useState<Record<string, DailyGoals>>({});

    const rotatedDays = getRotatedDays();

    const resetForm = () => {
        setStep(1);
        setName('');
        setSelectedWalletIds([]);
        setDistributionMode('same');
        setWeeklyGoalPerWallet({});
        setCustomDailyPerWallet({});
        setIsSubmitting(false);
    };

    const toggleWallet = (walletId: string) => {
        setSelectedWalletIds(prev =>
            prev.includes(walletId)
                ? prev.filter(id => id !== walletId)
                : [...prev, walletId]
        );
    };

    const selectedWallets = wallets.filter(w => selectedWalletIds.includes(w.id));

    // Calcula o daily auto (weekly / 7)
    const dailyAutoPerWallet = useMemo(() => {
        const result: Record<string, number> = {};
        selectedWalletIds.forEach(id => {
            const weekly = weeklyGoalPerWallet[id] || 0;
            result[id] = weekly / 7;
        });
        return result;
    }, [selectedWalletIds, weeklyGoalPerWallet]);

    const handleNext = () => {
        if (!name.trim()) return;
        if (selectedWalletIds.length === 0) return;
        setStep(2);
    };

    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        // Validações da etapa 2
        for (const walletId of selectedWalletIds) {
            const weekly = weeklyGoalPerWallet[walletId] || 0;
            if (weekly <= 0) return;

            if (distributionMode === 'custom') {
                const daily = customDailyPerWallet[walletId];
                const sum = Object.values(daily || {}).reduce((a, b) => a + b, 0);
                if (Math.abs(sum - weekly) > 0.01) return; // Soma dos dias deve bater com weekly
            }
        }

        setIsSubmitting(true);

        try {
            // Calcular datas (próxima segunda até domingo)
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Dom, 1 = Seg, ...
            const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
            const startDate = addDays(today, daysUntilMonday);
            startDate.setHours(0, 0, 0, 0);
            const endDate = addDays(startDate, 6);
            endDate.setHours(23, 59, 59, 999);

            const goalWallets = selectedWallets.map(wallet => {
                const weekly = weeklyGoalPerWallet[wallet.id] || 0;
                let dailyGoals: DailyGoals;

                if (distributionMode === 'same') {
                    const daily = weekly / 7;
                    dailyGoals = {
                        mon: daily, tue: daily, wed: daily, thu: daily,
                        fri: daily, sat: daily, sun: daily,
                    };
                } else {
                    dailyGoals = customDailyPerWallet[wallet.id] || {
                        mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
                    };
                }

                return {
                    walletId: wallet.id,
                    walletName: wallet.name,
                    weeklyGoal: weekly,
                    dailyGoals,
                };
            });

            const totalWeeklyGoal = goalWallets.reduce((sum, w) => sum + w.weeklyGoal, 0);

            await GoalService.createGoal({
                name: name.trim(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                totalWeeklyGoal,
                wallets: goalWallets,
            });

            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Failed to create goal', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const canProceedStep1 = name.trim().length > 0 && selectedWalletIds.length > 0;
    const canSubmit = selectedWalletIds.every(id => (weeklyGoalPerWallet[id] || 0) > 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === 1 ? 'Create New Goal' : 'Configure Goals'}
            size="lg"
        >
            {/* Indicador de Etapa */}
            <div className="flex items-center gap-2 mb-6">
                <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                    step >= 1 ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted'
                )}>1</div>
                <div className={cn('flex-1 h-0.5', step >= 2 ? 'bg-primary' : 'bg-border')} />
                <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                    step >= 2 ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted'
                )}>2</div>
            </div>

            {/* ETAPA 1: Nome + Wallets + Distribuição */}
            {step === 1 && (
                <div className="space-y-6">
                    <Input
                        label="Goal Name *"
                        placeholder="e.g., July Campaign, Summer Savings"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Wallets to Monitor *
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-border rounded-lg p-3">
                            {wallets.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-2">
                                    No wallets available. Create a wallet first.
                                </p>
                            ) : (
                                wallets.map(wallet => (
                                    <label
                                        key={wallet.id}
                                        className={cn(
                                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                            selectedWalletIds.includes(wallet.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-surface hover:bg-surface-elevated'
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedWalletIds.includes(wallet.id)}
                                            onChange={() => toggleWallet(wallet.id)}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-text-primary">{wallet.name}</p>
                                            <p className="text-xs text-text-muted capitalize">{wallet.type}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Goal Distribution
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setDistributionMode('same')}
                                className={cn(
                                    'p-3 rounded-lg border text-left transition-all',
                                    distributionMode === 'same'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-surface hover:border-border-light'
                                )}
                            >
                                <p className="text-sm font-medium text-text-primary">Same amount every day</p>
                                <p className="text-xs text-text-muted mt-1">Auto-divides weekly goal by 7</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDistributionMode('custom')}
                                className={cn(
                                    'p-3 rounded-lg border text-left transition-all',
                                    distributionMode === 'custom'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-surface hover:border-border-light'
                                )}
                            >
                                <p className="text-sm font-medium text-text-primary">Custom amount by day</p>
                                <p className="text-xs text-text-muted mt-1">Set different values for each day</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ETAPA 2: Valores por Wallet */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-sm text-text-primary">
                            Period: <span className="font-semibold">{format(addDays(new Date(), (8 - new Date().getDay()) % 7 || 7), 'MMM dd')}</span>
                            {' '}to{' '}
                            <span className="font-semibold">{format(addDays(new Date(), ((8 - new Date().getDay()) % 7 || 7) + 6), 'MMM dd, yyyy')}</span>
                        </p>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {selectedWallets.map(wallet => {
                            const weekly = weeklyGoalPerWallet[wallet.id] || 0;
                            const dailyAuto = dailyAutoPerWallet[wallet.id] || 0;

                            return (
                                <div key={wallet.id} className="p-4 bg-surface-elevated border border-border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-text-primary">{wallet.name}</h4>
                                        <Target className="h-4 w-4 text-text-muted" />
                                    </div>

                                    <Input
                                        label="Weekly Goal (USD) *"
                                        type="number"
                                        step="any"
                                        placeholder="0.00"
                                        value={weekly > 0 ? weekly.toString() : ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            setWeeklyGoalPerWallet(prev => ({ ...prev, [wallet.id]: val }));
                                        }}
                                    />

                                    {distributionMode === 'same' && weekly > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-surface rounded-md">
                                            <span className="text-xs text-text-muted">Daily Goal</span>
                                            <span className="text-sm font-semibold text-primary font-mono">
                                                {formatCurrency(dailyAuto)} <span className="text-xs text-text-muted">(auto)</span>
                                            </span>
                                        </div>
                                    )}

                                    {distributionMode === 'custom' && weekly > 0 && (
                                        <div className="grid grid-cols-7 gap-2 pt-2">
                                            {rotatedDays.map(day => {
                                                const current = customDailyPerWallet[wallet.id]?.[day] || 0;
                                                return (
                                                    <div key={day}>
                                                        <label className="block text-xs text-text-muted text-center mb-1">
                                                            {getDayLabel(day)}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={current > 0 ? current.toString() : ''}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                setCustomDailyPerWallet(prev => ({
                                                                    ...prev,
                                                                    [wallet.id]: {
                                                                        ...prev[wallet.id],
                                                                        [day]: val,
                                                                    } as DailyGoals,
                                                                }));
                                                            }}
                                                            className="w-full h-8 px-2 text-center text-xs bg-surface border border-border rounded text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer com Navegação */}
            <div className="flex justify-between gap-3 pt-6 border-t border-border mt-6">
                {step === 1 ? (
                    <>
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleNext}
                            disabled={!canProceedStep1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button type="button" variant="ghost" onClick={handleBack}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </>
                )}
            </div>
        </Modal>
    );
}