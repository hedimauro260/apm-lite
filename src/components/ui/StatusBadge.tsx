import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Clock, PauseCircle, AlertCircle } from 'lucide-react';

export type StatusType = 'active' | 'inactive' | 'completed' | 'pending' | 'failed' | 'paused';

export interface StatusBadgeProps {
    status: StatusType | string;
    className?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Active', color: 'text-success bg-success/10', icon: <CheckCircle2 className="h-3 w-3" /> },
    inactive: { label: 'Inactive', color: 'text-text-muted bg-surface-elevated', icon: <XCircle className="h-3 w-3" /> },
    completed: { label: 'Completed', color: 'text-success bg-success/10', icon: <CheckCircle2 className="h-3 w-3" /> },
    pending: { label: 'Pending', color: 'text-warning bg-warning/10', icon: <Clock className="h-3 w-3" /> },
    failed: { label: 'Failed', color: 'text-danger bg-danger/10', icon: <AlertCircle className="h-3 w-3" /> },
    paused: { label: 'Paused', color: 'text-info bg-info/10', icon: <PauseCircle className="h-3 w-3" /> },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status.toLowerCase()] || {
        label: status,
        color: 'text-text-secondary bg-surface-elevated',
        icon: null,
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                config.color,
                className
            )}
        >
            {config.icon}
            {config.label}
        </span>
    );
}