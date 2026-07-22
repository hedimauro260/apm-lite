import { cn } from '../../lib/utils';

export interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
    label?: string;
    colorClass?: string;
}

export function CircularProgress({
    percentage,
    size = 64,
    strokeWidth = 6,
    className,
    label,
    colorClass = 'text-primary',
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-surface-elevated"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn('transition-all duration-1000 ease-out', colorClass)}
                />
            </svg>
            {/* Center Label */}
            {label && (
                <span className="absolute text-xs font-bold text-text-primary">
                    {label}
                </span>
            )}
        </div>
    );
}