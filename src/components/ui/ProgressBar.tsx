import { cn, calculatePercentage } from '../../lib/utils';

export interface ProgressBarProps {
    value: number;
    max?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    showLabel?: boolean;
    className?: string;
    labelClassName?: string;
}

const colorMap: Record<string, string> = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning',
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

    // ✅ Se for uma cor personalizada (começa com #), usa inline style
    const isCustomColor = color.startsWith('#');
    const bgColor = isCustomColor ? '' : colorMap[color] || 'bg-primary';

    return (
        <div className={cn('w-full', className)}>
            <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        !isCustomColor && bgColor
                    )}
                    style={
                        isCustomColor
                            ? { backgroundColor: color, width: `${percentage}%` }
                            : { width: `${percentage}%` }
                    }
                />
            </div>
            {showLabel && (
                <div className={cn('flex justify-between text-xs text-text-muted mt-1', labelClassName)}>
                    <span>{value.toFixed(2)}</span>
                    <span>{percentage.toFixed(1)}%</span>
                </div>
            )}
        </div>
    );
}