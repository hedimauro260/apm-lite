import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // em milissegundos (padrão: 4000)
}

interface ToastContextType {
    toast: (data: Omit<ToastData, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Configurações visuais por tipo
const TOAST_STYLES: Record<ToastType, { icon: ReactNode; bg: string; border: string; text: string }> = {
    success: {
        icon: <CheckCircle className="h-5 w-5" />,
        bg: 'bg-success/10',
        border: 'border-success/20',
        text: 'text-success',
    },
    error: {
        icon: <XCircle className="h-5 w-5" />,
        bg: 'bg-danger/10',
        border: 'border-danger/20',
        text: 'text-danger',
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5" />,
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        text: 'text-warning',
    },
    info: {
        icon: <Info className="h-5 w-5" />,
        bg: 'bg-info/10',
        border: 'border-info/20',
        text: 'text-info',
    },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((data: Omit<ToastData, 'id'>) => {
        const id = crypto.randomUUID();
        const duration = data.duration || 4000; // Padrão de 4 segundos

        setToasts((prev) => [...prev, { ...data, id }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            {/* Container de Toasts */}
            <div className="fixed top-4 right-4 z-998 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((t) => {
                    const style = TOAST_STYLES[t.type];
                    return (
                        <div
                            key={t.id}
                            role="alert"
                            aria-live="assertive"
                            className={cn(
                                'pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-dropdown backdrop-blur-sm animate-toast',
                                style.bg,
                                style.border
                            )}
                        >
                            <div className={cn('shrink-0 mt-0.5', style.text)}>
                                {style.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-semibold', style.text)}>
                                    {t.title}
                                </p>
                                {t.message && (
                                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                        {t.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                                aria-label="Fechar notificação"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Adiciona no final do src/components/ui/Toast.tsx

export interface ToastProps {
    title: string;
    message?: string;
    type?: ToastType;
    onClose?: () => void;
    className?: string;
}

export function Toast({ title, message, type = 'info', onClose, className }: ToastProps) {
    const style = TOAST_STYLES[type];
    return (
        <div
            role="alert"
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border shadow-dropdown backdrop-blur-sm',
                style.bg,
                style.border,
                className
            )}
        >
            <div className={cn('shrink-0 mt-0.5', style.text)}>{style.icon}</div>
            <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', style.text)}>{title}</p>
                {message && (
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        {message}
                    </p>
                )}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Fechar notificação"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}