import { cn, calculatePercentage } from '../../lib/utils';

export interface ProgressBarProps {
    value: number;
    max?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    showLabel?: boolean;
    className?: string;
    labelClassName?: string;
}

const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
};

export function ProgressBar({
    value,
    max = 100,
    color = 'primary',
    showLabel = true,
    className,
    labelClassName,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max(calculatePercentage(value, max), 0), 100);

    return (
        <div className={cn('w-full space-y-2', className)}>
            {showLabel && (
                <div className="flex justify-between items-center">
                    <span className={cn('text-xs font-medium text-text-secondary', labelClassName)}>
                        Progress
                    </span>
                    <span className="text-xs font-semibold text-text-primary">
                        {percentage.toFixed(1)}%
                    </span>
                </div>
            )}
            <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-300 ease-out', colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}