// src/components/layout/MobileHeader/MobileHeader.tsx
import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { cn, computeWalletBalance, formatCurrency, formatPercentage, APP_VERSION } from "../../../lib/utils";
import { db } from "../../../database/db";
import { Link, useLocation } from "react-router-dom";
import { CloudUpload, Sun, Moon, X, Wallet, LayoutDashboard, Activity, History, Target, Settings, TrendingUp, Globe } from "lucide-react";
import logo from '../../../assets/images/logo_transparent.webp';
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ Importar
import { BackupRestoreModal } from "../../modals/BackupRestoreModal";

export interface MobileHeaderProps {
    className?: string;
}

const NAV_ITEMS = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/wallets", label: "Wallets", icon: Wallet },
    { path: "/assets", label: "Assets", icon: Activity },
    { path: '/websites', label: 'Websites', icon: Globe },
    { path: "/transactions", label: "Transactions", icon: History },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/settings", label: "Settings", icon: Settings },
];

// ✅ Formatar data para exibição
const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function MobileHeader({ className }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState<string>("");
    const [isBackupOpen, setIsBackupOpen] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme(); // ✅ Obter tema e toggle

    // ✅ Atualizar data ao montar o componente
    useEffect(() => {
        setCurrentDate(formatDate(new Date()));
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    // ✅ Ícone do tema
    const ThemeIcon = theme === 'dark' ? Moon : Sun;

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
        <>
            {/* Header */}
            <header className={cn(
                "fixed top-0 left-0 z-40 h-16 w-full bg-background/80 border-b border-border transition-all duration-300",
                className
            )}>
                <div className="h-full w-full py-2 px-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <img src={logo} alt="logo" className="h-8 w-8" />
                        </div>
                        <span className="font-bold text-text-primary text-lg hidden">
                            APM Lite
                        </span>
                    </Link>

                    <div className="flex items-center justify-center py-2 px-4 rounded-md bg-background border border-border">
                        <p className="text-sm font-medium text-text-primary">
                            {formatCurrency(totalBalance)}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={toggleMenu}
                            className={cn(
                                "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                                "hover:bg-surface-elevated active:scale-95",
                                isOpen && "bg-primary/10 text-primary"
                            )}
                            aria-label="Menu"
                        >
                            <div className="relative w-5 h-5">
                                <span className={cn(
                                    "absolute left-0 h-0.5 bg-current rounded-full transition-all duration-300",
                                    isOpen ? "top-2 rotate-45 w-5" : "top-0 w-5"
                                )} />
                                <span className={cn(
                                    "absolute left-0 top-2 h-0.5 bg-current rounded-full transition-all duration-300",
                                    isOpen ? "opacity-0 w-0" : "w-5"
                                )} />
                                <span className={cn(
                                    "absolute left-0 h-0.5 bg-current rounded-full transition-all duration-300",
                                    isOpen ? "top-2 -rotate-45 w-5" : "top-4 w-4"
                                )} />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={toggleMenu}
            />

            {/* Mobile Menu Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 z-50 w-full h-full bg-sidebar border-l border-border shadow-modal transition-transform duration-300 ease-out",
                    "flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between py-2 px-4 border-b border-border shrink-0">
                    <div className="flex flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <img src={logo} alt="logo" className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-text-primary">APM Lite</p>
                            <p className="text-sm text-text-muted">Asset Portfolio Manager</p>
                        </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-text-primary font-semibold text-sm">
                        HM
                    </div>
                </div>

                {/* Balance Summary - Com data atual dinâmica */}
                <div className="px-4 py-2 shrink-0">
                    <div className="py-3 px-4 flex flex-col justify-between bg-background rounded-md border border-border">
                        <span className='mb-2 text-sm text-text-muted'>
                            {currentDate || "Loading..."}
                        </span>
                        <p className='mb-1 font-bold text-base text-text-muted'>Total Balance</p>
                        <div className='flex items-end gap-4'>
                            <span className='text-2xl font-bold text-text-primary'>{formatCurrency(totalBalance)}</span>
                            <span className='flex items-center gap-2 text-sm text-success'>
                                <TrendingUp className="h-3.5 w-3.5" />
                                {formatPercentage(variation)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-3 min-h-0">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-primary" : "text-text-muted"
                                )} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-6 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Botões e Footer */}
                <div className="shrink-0">
                    <div className="flex items-center justify-center gap-6 p-4 border-t border-border">
                        <button
                            onClick={() => setIsBackupOpen(true)}
                            className="p-2 rounded-full bg-primary/60 transition-colors hover:bg-primary/80"
                            aria-label="Backup/restore"
                        >
                            <CloudUpload className="h-6 w-6 text-text-primary" />
                        </button>

                        <button
                            onClick={toggleMenu}
                            className="p-3 rounded-full bg-danger transition-colors hover:bg-danger-hover"
                            aria-label="Close menu"
                        >
                            <X className="h-7 w-7 text-text-primary" />
                        </button>

                        {/* ✅ Botão Toggle Theme Funcional */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-primary/60 transition-colors hover:bg-primary/80"
                            aria-label="Toggle theme"
                        >
                            <ThemeIcon className="h-6 w-6 text-text-primary" />
                        </button>
                    </div>

                    <div className="border-t border-border p-4">
                        <p className="text-xs text-text-muted text-center">
                            APM Lite v{APP_VERSION}
                        </p>
                    </div>
                </div>
            </div>

            <BackupRestoreModal open={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
        </>
    );
}