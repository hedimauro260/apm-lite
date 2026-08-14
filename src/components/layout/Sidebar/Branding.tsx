// src/components/layout/Sidebar/Branding.tsx
import logo from '../../../assets/images/logo_transparent.webp';
import { cn } from "../../../lib/utils";

export interface BrandingProps {
    isOpen?: boolean;
}

export function Branding({
    isOpen = true,
}: BrandingProps) {
    return (
        <div className={cn(
            "w-full h-16 flex items-center gap-3 transition-all duration-300",
            isOpen ? "pl-3" : "justify-center pl-0 gap-0"
        )}>
            {/* Logo - sempre visível */}
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary shrink-0">
                <img src={logo} alt="logo" className="h-10 w-10" />
            </div>

            {/* Texto - visível apenas quando aberto */}
            <div className={cn(
                "flex flex-col transition-all duration-300 overflow-hidden",
                isOpen ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
            )}>
                <span className="text-lg font-bold text-text-primary leading-tight whitespace-nowrap">
                    APM Lite
                </span>
                <span className="text-xs font-medium text-text-muted tracking-wide whitespace-nowrap">
                    Asset Portfolio Manager
                </span>
            </div>
        </div>
    );
}