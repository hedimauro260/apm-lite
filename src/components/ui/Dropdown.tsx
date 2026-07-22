import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [actualAlign, setActualAlign] = useState<'left' | 'right'>(align);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Detecta borda e reposiciona se necessário
    useEffect(() => {
        if (isOpen && triggerRef.current && dropdownRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Se o dropdown ultrapassar a borda direita, reposiciona para a esquerda
            if (triggerRect.right + dropdownRect.width > viewportWidth) {
                setActualAlign('right');
            } else {
                setActualAlign(align);
            }
        }
    }, [isOpen, align]);

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        'absolute z-dropdown mt-2 min-w-48 bg-surface-elevated border border-border rounded-md shadow-dropdown py-1 animate-in fade-in',
                        actualAlign === 'left' ? 'left-0' : 'right-0',
                        className
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}


export interface DropdownItemProps {
    onClick?: () => void;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}

export function DropdownItem({ onClick, children, className, disabled }: DropdownItemProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left flex items-center gap-2',
                'disabled:pointer-events-none disabled:opacity-50',
                className
            )}
        >
            {children}
        </button>
    );
}

export interface DropdownTriggerProps {
    children: ReactNode;
    className?: string;
}

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
    return (
        <div className={cn('inline-flex items-center gap-2', className)}>
            {children}
            <ChevronDown className="h-4 w-4 text-text-muted" />
        </div>
    );
}