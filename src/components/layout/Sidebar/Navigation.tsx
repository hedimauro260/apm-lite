import { useLocation, Link } from 'react-router-dom';
import { NavItem } from '../../ui/NavItem';
import { LayoutDashboard, Wallet, PieChart, History, Target } from 'lucide-react';

export interface NavItemData {
    path: string;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
}

const navItems: NavItemData[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
    { path: '/wallets', label: 'Wallets', icon: <Wallet /> },
    { path: '/assets', label: 'Assets', icon: <PieChart /> },
    { path: '/transactions', label: 'Transactions', icon: <History /> },
    { path: '/goals', label: 'Goals', icon: <Target /> },
];

export function Navigation() {
    const location = useLocation();

    return (
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="block">
                    <NavItem
                        icon={item.icon}
                        label={item.label}
                        isActive={location.pathname === item.path}
                        onClick={() => { }} // O Link já lida com a navegação
                        badge={item.badge}
                    />
                </Link>
            ))}
        </nav>
    );
}