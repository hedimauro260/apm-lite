import { Moon, Sun } from 'lucide-react';
import { InstallButton } from '../../ui/InstallButton';
import { Switch } from '../../ui/Switch'; // Ajuste o caminho de importação se necessário

export interface FooterProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    version: string;
}

export function Footer({ theme, onToggleTheme, version }: FooterProps) {
    return (
        <div className="mt-auto border-t border-border p-4 space-y-3">

            {/* Linha do Toggle de Tema com Switch */}
            <div className="flex items-center justify-between px-3 py-1">
                <div className="flex items-center gap-2 text-text-secondary">
                    {theme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                    {/* ✅ Agora o texto muda dinamicamente dependendo do tema */}
                    <span className="text-sm font-medium">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>

                <Switch
                    checked={theme === 'dark'}
                    onChange={onToggleTheme}
                />
            </div>

            <InstallButton />

            {/* Versão */}
            <div className="flex items-center justify-center px-3 pt-2 border-t border-border/50">
                <span className="text-xs text-text-muted">Version {version}</span>
            </div>
        </div>
    );
}