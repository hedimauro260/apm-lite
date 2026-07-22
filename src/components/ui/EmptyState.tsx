import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon = <Inbox className="h-10 w-10 text-text-muted" />,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center px-4', className)}>
            <div className="mb-4 p-4 bg-surface-elevated rounded-full">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}