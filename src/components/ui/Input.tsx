import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary',
                        'placeholder:text-text-muted',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent',
                        'disabled:pointer-events-none disabled:opacity-50',
                        'transition-all duration-150',
                        error && 'border-danger focus-visible:ring-danger',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                {helperText && !error && <p className="text-sm text-text-muted">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };