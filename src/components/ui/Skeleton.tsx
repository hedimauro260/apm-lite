// src/components/ui/Skeleton.tsx
import { cn } from '../../lib/utils';

export interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'rectangular' | 'circular' | 'text' | 'card';
    animated?: boolean;
}

export function Skeleton({
    className,
    width,
    height,
    variant = 'rectangular',
    animated = true,
}: SkeletonProps) {
    const baseStyles = 'bg-surface-elevated/50';

    const variantStyles = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full aspect-square',
        text: 'rounded h-4',
        card: 'rounded-lg',
    };

    const widthStyles = width ? `w-${typeof width === 'number' ? `${width}px` : width}` : 'w-full';
    const heightStyles = height
        ? `h-${typeof height === 'number' ? `${height}px` : height}`
        : variant === 'text' ? 'h-4' : 'h-8';

    const animationStyles = animated
        ? 'animate-pulse'
        : '';

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                widthStyles,
                heightStyles,
                animationStyles,
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
}

// Componentes helpers para casos comuns
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : '100%'} />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return <Skeleton variant="circular" width={size} height={size} />;
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('p-4 space-y-4', className)}>
            <div className="flex items-center gap-4">
                <SkeletonAvatar size={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} />
                </div>
            </div>
            <Skeleton width="100%" height={80} variant="card" />
            <div className="flex gap-2">
                <Skeleton width="30%" height={32} />
                <Skeleton width="30%" height={32} />
            </div>
        </div>
    );
}