import { cn } from '../../../lib/utils';
import { Branding } from './Branding';
import { PortfolioOverview } from './PortfolioOverview';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export interface SidebarProps {
    totalBalance: number;
    balanceVariation: number;
    balanceChange?: number; // ✅ Novo prop opcional
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    version?: string;
    className?: string;
}

export function Sidebar({
    totalBalance,
    balanceVariation,
    balanceChange,
    theme,
    onToggleTheme,
    version = '0.10.0',
    className,
}: SidebarProps) {
    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen w-66 bg-sidebar border-r border-border flex flex-col transition-all duration-300',
                className
            )}
        >
            <Branding />
            <Navigation />
            <PortfolioOverview
                totalBalance={totalBalance}
                variation={balanceVariation}
                change={balanceChange}
            />
            <Footer theme={theme} onToggleTheme={onToggleTheme} version={version} />
        </aside>
    );
}