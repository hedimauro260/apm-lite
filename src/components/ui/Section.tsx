import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    noPadding?: boolean; // Útil para tabelas que precisam de borda a borda
}

export function Section({ title, actions, children, className, noPadding = false }: SectionProps) {
    return (
        <section className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {/* Body */}
            <div className={cn(!noPadding && 'p-6')}>
                {children}
            </div>
        </section>
    );
}