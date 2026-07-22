// src/components/ui/ActionGroup.tsx
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ActionItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'ghost' | 'secondary' | 'danger';
    disabled?: boolean;
    title?: string; // Tooltip
}

export interface ActionGroupProps {
    actions: ActionItem[];
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    iconOnly?: boolean; // Novo prop
}

export function ActionGroup({ actions, className, orientation = 'horizontal', iconOnly = false }: ActionGroupProps) {
    return (
        <div
            className={cn(
                'flex gap-1',
                orientation === 'vertical' ? 'flex-col w-full' : 'flex-wrap',
                className
            )}
        >
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant={action.variant || 'ghost'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.title || action.label}
                    className={cn(
                        orientation === 'vertical' && 'w-full justify-start',
                        iconOnly && 'px-2' // Reduz padding quando icon-only
                    )}
                >
                    {action.icon && <span className="h-4 w-4">{action.icon}</span>}
                    {!iconOnly && action.label && <span>{action.label}</span>}
                </Button>
            ))}
        </div>
    );
}