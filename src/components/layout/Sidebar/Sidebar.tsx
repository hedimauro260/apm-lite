// src/components/layout/Sidebar/Sidebar.tsx
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { cn, computeWalletBalance, APP_VERSION } from "../../../lib/utils";
import { db } from "../../../database/db";
import { Branding } from "./Branding";
import { Navigation } from "./Navigation";
import { PortfolioOverview } from "./PortfolioOverview";
import { SideFooter } from "./SideFooter";

export interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    theme?: 'light' | 'dark';        // ✅ Adicionar
    onToggleTheme?: () => void;      // ✅ Adicionar
}

export function Sidebar({
    className,
    isOpen = true,
    theme = 'dark',                  // ✅ Valor padrão
    onToggleTheme = () => { },        // ✅ Função padrão
}: SidebarProps) {
    const wallets = useLiveQuery(() => db.wallets.toArray(), [], []);
    const transactions = useLiveQuery(() => db.transactions.toArray(), [], []);

    const { totalBalance, variation } = useMemo(() => {
        const total = wallets.reduce(
            (sum, wallet) => sum + computeWalletBalance(wallet.id, transactions),
            0,
        );

        const dayStart = Date.now() - 24 * 60 * 60 * 1000;
        const netChange = transactions.reduce((sum, t) => {
            if (t.status !== "completed" || t.type === "transfer") return sum;
            if (new Date(t.date).getTime() < dayStart) return sum;
            return sum + t.amount;
        }, 0);

        const variation = total === 0 ? 0 : Number(((netChange / total) * 100).toFixed(2));
        return { totalBalance: total, variation };
    }, [wallets, transactions]);

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-border transition-all duration-300",
            isOpen ? "w-66 justify-start" : "w-18 justify-center",
            "hidden md:flex md:flex-col",
            className
        )}>
            <Branding isOpen={isOpen} />
            <Navigation isOpen={isOpen} />
            <PortfolioOverview
                totalBalance={totalBalance}
                variation={variation}
                isOpen={isOpen}
            />
            <SideFooter
                theme={theme}              // ✅ Tema real
                onToggleTheme={onToggleTheme} // ✅ Função real
                version={APP_VERSION}
                isOpen={isOpen}
            />
        </aside>
    );
}