import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NavItemProps {
    icon: ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: number | string;
    className?: string;
}

export function NavItem({ icon, label, isActive, onClick, badge, className }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                className
            )}
        >
            <span className={cn('inline-flex items-center justify-center h-4 w-4', isActive ? 'text-primary' : 'text-text-muted')}>
                {icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    isActive ? 'bg-primary text-white' : 'bg-surface-elevated text-text-secondary'
                )}>
                    {badge}
                </span>
            )}
        </button>
    );
}