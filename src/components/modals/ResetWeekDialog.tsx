import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Archive, RotateCcw, XCircle } from 'lucide-react';

export interface ResetWeekDialogProps {
    isOpen: boolean;
    onClose: () => void;
    hasProgress: boolean;
    onFinishWeek: () => void;
    onResetWithoutSaving: () => void;
    isProcessing: boolean;
}

export function ResetWeekDialog({
    isOpen,
    onClose,
    hasProgress,
    onFinishWeek,
    onResetWithoutSaving,
    isProcessing,
}: ResetWeekDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reset Week" size="sm">
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">
                            {hasProgress
                                ? 'Current week has progress.'
                                : 'No progress recorded this week.'}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                            {hasProgress
                                ? 'What would you like to do with the current progress?'
                                : 'You can safely reset to start fresh.'}
                        </p>
                    </div>
                </div>

                {hasProgress && (
                    <div className="space-y-2">
                        <button
                            onClick={() => { onFinishWeek(); }}
                            disabled={isProcessing}
                            className="w-full flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left group disabled:opacity-50"
                        >
                            <div className="p-2 rounded-lg bg-success/10 text-success group-hover:bg-success/20">
                                <Archive className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">Finish Week</p>
                                <p className="text-xs text-text-muted">Archive current progress and start fresh</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { onResetWithoutSaving(); }}
                            disabled={isProcessing}
                            className="w-full flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-lg hover:border-danger hover:bg-danger/5 transition-colors text-left group disabled:opacity-50"
                        >
                            <div className="p-2 rounded-lg bg-danger/10 text-danger group-hover:bg-danger/20">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">Reset Without Saving</p>
                                <p className="text-xs text-text-muted">Discard all current progress permanently</p>
                            </div>
                        </button>
                    </div>
                )}

                {!hasProgress && (
                    <button
                        onClick={() => { onResetWithoutSaving(); }}
                        disabled={isProcessing}
                        className="w-full flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left group disabled:opacity-50"
                    >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">Reset Week</p>
                            <p className="text-xs text-text-muted">Start a fresh week</p>
                        </div>
                    </button>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}