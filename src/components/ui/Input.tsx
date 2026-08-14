import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    variant?: 'default' | 'filled' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-base',
};

const variantClasses = {
    default: 'bg-surface border border-border',
    filled: 'bg-gray-100 dark:bg-gray-800 border border-transparent',
    outline: 'bg-transparent border-2 border-border',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            id,
            iconLeft,
            iconRight,
            variant = 'default',
            size = 'md',
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const helperTextId = `${inputId}-helper`;
        const errorId = `${inputId}-error`;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary"
                    >
                        {label}
                        {props.required && (
                            <span className="text-danger ml-1" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {iconLeft && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                            {iconLeft}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={
                            [
                                helperText && !error ? helperTextId : '',
                                error ? errorId : '',
                            ]
                                .filter(Boolean)
                                .join(' ') || undefined
                        }
                        className={cn(
                            'w-full rounded-md text-text-primary',
                            'placeholder:text-text-muted',
                            'transition-all duration-150',
                            'hover:border-border-hover',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent',
                            'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
                            'read-only:bg-gray-50 read-only:dark:bg-gray-900 read-only:cursor-default',
                            variantClasses[variant],
                            sizeClasses[size],
                            iconLeft && 'pl-10',
                            iconRight && 'pr-10',
                            error && 'border-danger hover:border-danger focus-visible:ring-danger',
                            className
                        )}
                        {...props}
                    />

                    {iconRight && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {iconRight}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={errorId} className="text-sm text-danger" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={helperTextId} className="text-sm text-text-muted">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };