// src/components/layout/Sidebar/SideFooter.tsx
import { Moon, Sun } from 'lucide-react';
import { InstallButton } from '../../ui/InstallButton';
import { Switch } from '../../ui/Switch';
import { cn } from "../../../lib/utils";

export interface SideFooterProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    version: string;
    isOpen?: boolean;
}

export function SideFooter({
    theme,
    onToggleTheme,
    version,
    isOpen = true
}: SideFooterProps) {
    return (
        <div className={cn(
            "mt-auto border-t border-border transition-all duration-300",
            isOpen ? "p-4 space-y-3" : "p-2 space-y-2"
        )}>
            {/* Linha do Toggle de Tema com Switch */}
            <div className={cn(
                "flex items-center transition-all duration-300",
                isOpen ? "justify-between px-6 py-1" : "justify-center px-1 py-1"
            )}>
                {isOpen ? (
                    // ✅ Versão completa (sidebar aberto)
                    <>
                        <div className="flex items-center gap-2 text-text-secondary">
                            {theme === 'dark' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onChange={onToggleTheme}
                        />
                    </>
                ) : (
                    // ✅ Versão compacta (sidebar fechado) - apenas o Switch
                    <Switch
                        checked={theme === 'dark'}
                        onChange={onToggleTheme}
                    />
                )}
            </div>

            {/* Install Button - oculto quando fechado */}
            {isOpen && <InstallButton />}

            {/* Versão - apenas o número quando fechado */}
            <div className={cn(
                "flex items-center border-t border-border/50 transition-all duration-300",
                isOpen ? "justify-center px-3 pt-2" : "justify-center pt-1"
            )}>
                <span className={cn(
                    "text-text-muted",
                    isOpen ? "text-xs" : "text-[10px] font-mono"
                )}>
                    {isOpen ? `Version ${version}` : version}
                </span>
            </div>
        </div>
    );
}