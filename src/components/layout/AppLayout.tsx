// src/components/layout/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { BackupRestoreModal } from '../modals/BackupRestoreModal';
import { useActiveDates } from '../../hooks/useActiveDates';
import { useNotifications } from '../../hooks/useNotifications';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../database/db';
//import { type Wallet } from '../../types';
import { useToast } from '../ui/Toast';
import { Skeleton } from '../ui/Skeleton';

export function AppLayout() {
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const [totalBalance, setTotalBalance] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { data: portfolioData } = usePortfolio();
    const { activeDates, refresh: refreshActiveDates } = useActiveDates();
    const { notifications, unreadCount, markAsRead, markAllAsRead, refresh: refreshNotifications } = useNotifications();

    // Busca o saldo total para a Sidebar
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const wallets = await db.wallets.toArray();
                const total = wallets.reduce((sum, w) => sum + w.balance, 0);
                setTotalBalance(total);
            } catch (error) {
                console.error('Error loading wallets:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Atualizar dias ativos e notificações
    useEffect(() => {
        refreshActiveDates();
        refreshNotifications();
    }, [refreshActiveDates, refreshNotifications]);

    // Dados do usuário
    const userName = "Hedi Mauro";

    // Variação calculada dinamicamente
    const balanceVariation = portfolioData?.balanceVariation ?? 0;
    const balanceChange = portfolioData?.balanceChange ?? 0;

    // Handlers
    const handleBackup = () => setIsBackupModalOpen(true);
    const handleLogout = () => toast({ type: 'info', title: 'Logout clicked' });
    const handleProfile = () => toast({ type: 'info', title: 'Profile settings' });
    const handleActiveDateClick = (date: Date) => {
        toast({ type: 'info', title: 'Viewing transactions', message: date.toLocaleDateString() });
    };
    const handleNotificationClick = (notification: any) => {
        toast({ type: 'info', title: notification.title, message: notification.message });
    };
    const handleBackupSuccess = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex overflow-hidden">
            {/* Sidebar - sem Skeleton */}
            <Sidebar
                totalBalance={totalBalance}
                balanceVariation={balanceVariation}
                balanceChange={balanceChange}
                theme={theme}
                onToggleTheme={toggleTheme}
                version="0.10.0"
            />

            <div className="flex-1 flex flex-col h-screen pl-66 overflow-hidden">
                {/* Header - sem Skeleton */}
                <Header
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    activeDates={activeDates}
                    onActiveDateClick={handleActiveDateClick}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    userName={userName}
                    onBackup={handleBackup}
                    onLogout={handleLogout}
                    onProfile={handleProfile}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onNotificationClick={handleNotificationClick}
                />

                {/* ✅ Conteúdo da Página com Skeleton */}
                <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {isLoading ? (
                        <div className="space-y-6">
                            {/* Grid de 4 cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="card p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <Skeleton width="80px" height={12} />
                                                <Skeleton width="100px" height={24} />
                                            </div>
                                            <Skeleton variant="circular" width={40} height={40} />
                                        </div>
                                        <Skeleton width="120px" height={16} />
                                        <Skeleton width="100%" height={40} />
                                    </div>
                                ))}
                            </div>

                            {/* Grid 2/3 + 1/3 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <div className="card p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Skeleton width="120px" height={20} />
                                            <Skeleton width="80px" height={32} />
                                        </div>
                                        <Skeleton width="100%" height={200} />
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="card p-6 space-y-4">
                                        <Skeleton width="100px" height={20} />
                                        <div className="space-y-3">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton variant="circular" width={32} height={32} />
                                                        <Skeleton width="80px" height={16} />
                                                    </div>
                                                    <Skeleton width="60px" height={16} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabela de atividades */}
                            <div className="card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Skeleton width="150px" height={20} />
                                    <Skeleton width="100px" height={32} />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton width="30%" height={16} />
                                            <Skeleton width="20%" height={16} />
                                            <Skeleton width="15%" height={16} />
                                            <Skeleton width="20%" height={16} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>

                {/* Footer */}
                <Footer />

                {/* Modal de Backup */}
                <BackupRestoreModal
                    isOpen={isBackupModalOpen}
                    onClose={() => setIsBackupModalOpen(false)}
                    onSuccess={handleBackupSuccess}
                />
            </div>
        </div>
    );
}