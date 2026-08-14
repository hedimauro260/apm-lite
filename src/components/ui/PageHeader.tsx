import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8', className)}>
            <div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}