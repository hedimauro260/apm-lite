// src/components/ui/NavItem.tsx
import { cn } from "../../lib/utils";

export interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    badge?: number | string;
    className?: string;
    isOpen?: boolean; // ✅ Nova prop
}

export function NavItem({
    icon,
    label,
    isActive = false,
    onClick,
    badge,
    className,
    isOpen = true, // ✅ Valor padrão
}: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                "hover:bg-surface-elevated hover:text-text-primary",
                isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary",
                // ✅ Quando fechado, centraliza o ícone
                !isOpen && "justify-center gap-0",
                className
            )}
        >
            {/* Ícone sempre visível */}
            <span className={cn(
                "shrink-0",
                "[&>svg]:w-4 [&>svg]:h-4",
                isActive ? "text-primary" : "text-text-muted"
            )}>
                {icon}
            </span>

            {/* Label - visível apenas quando aberto */}
            <span className={cn(
                "flex-1 text-left text-xs transition-all duration-300",
                isOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0 w-0 overflow-hidden"
            )}>
                {label}
            </span>

            {/* Badge - visível apenas quando aberto */}
            {badge && isOpen && (
                <span className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-elevated text-text-muted"
                )}>
                    {badge}
                </span>
            )}
        </button>
    );
}