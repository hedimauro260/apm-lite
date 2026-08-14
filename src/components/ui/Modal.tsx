import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    variant?: 'default' | 'danger' | 'info' | 'success';
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw] max-h-[95vh]',
};

const variantClasses = {
    default: {
        header: 'bg-surface',
        icon: 'bg-primary/10 text-primary',
    },
    danger: {
        header: 'bg-red-50 dark:bg-red-950/30',
        icon: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    },
    info: {
        header: 'bg-blue-50 dark:bg-blue-950/30',
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    success: {
        header: 'bg-green-50 dark:bg-green-950/30',
        icon: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400',
    },
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
    size = 'md',
    variant = 'default',
    closeOnBackdrop = true,
    showCloseButton = true,
}: ModalProps) {
    const titleId = useId();

    // Bloqueia o scroll do body quando aberto
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Fecha com ESC
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const styles = variantClasses[variant];

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
        >
            {/* Backdrop com animação */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/50 backdrop-blur-sm',
                    'animate-in fade-in duration-200',
                    closeOnBackdrop && 'cursor-pointer'
                )}
                onClick={closeOnBackdrop ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Container do modal */}
            <div
                className={cn(
                    'relative flex flex-col w-full',
                    'bg-surface border border-border rounded-xl shadow-2xl',
                    'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200',
                    'max-h-[85vh] overflow-hidden',
                    sizeClasses[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()} // Evita fechar clicando dentro
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div
                        className={cn(
                            'flex items-start justify-between gap-4 px-6 py-4 border-b border-border/50',
                            styles.header
                        )}
                    >
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h2
                                    id={titleId}
                                    className="text-lg font-semibold text-text-primary leading-tight"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-text-muted">
                                    {description}
                                </p>
                            )}
                        </div>

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                aria-label="Fechar modal"
                                className={cn(
                                    'shrink-0 rounded-lg p-1.5',
                                    'text-text-muted hover:text-text-primary',
                                    'hover:bg-black/5 dark:hover:bg-white/10',
                                    'transition-all duration-150',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/30'
                                )}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body com scroll interno */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-surface-alt/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}