// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
//import { format } from 'date-fns';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    date: Date;
    read: boolean;
    link?: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Carregar notificações (simuladas - integrar com eventos reais)
    const loadNotifications = useCallback(async () => {
        try {
            setIsLoading(true);

            // Buscar transações recentes para gerar notificações
            const transactions = await db.transactions.toArray();
            const recentTxs = transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);

            const generatedNotifications: Notification[] = recentTxs.map((tx, index) => ({
                id: `notif-${tx.id}`,
                type: tx.type === 'deposit' ? 'success' : tx.type === 'withdraw' ? 'error' : 'info',
                title: `${tx.type === 'deposit' ? 'Deposit' : tx.type === 'withdraw' ? 'Withdrawal' : 'Transaction'} Completed`,
                message: `${tx.coin} ${Math.abs(tx.amount).toFixed(2)} - ${tx.description || 'No description'}`,
                date: new Date(tx.date),
                read: index > 2, // Marcar as 3 primeiras como não lidas
                link: '/transactions',
            }));

            // ✅ Adicionar notificações de sistema (exemplo)
            const systemNotifications: Notification[] = [
                {
                    id: 'system-1',
                    type: 'warning',
                    title: 'Weekly Goal Reminder',
                    message: 'You are 30% away from your weekly goal',
                    date: new Date(Date.now() - 3600000 * 2),
                    read: false,
                    link: '/goals',
                },
                {
                    id: 'system-2',
                    type: 'info',
                    title: 'Portfolio Update',
                    message: 'BTC price increased by 5.2% in the last 24h',
                    date: new Date(Date.now() - 3600000 * 5),
                    read: true,
                    link: '/assets',
                },
            ];

            setNotifications([...generatedNotifications, ...systemNotifications]);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // ✅ Marcar como lida
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    // ✅ Marcar todas como lidas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    // ✅ Adicionar nova notificação (usar em eventos)
    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            date: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    // ✅ Contar não lidas
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        addNotification,
        refresh: loadNotifications,
    };
}