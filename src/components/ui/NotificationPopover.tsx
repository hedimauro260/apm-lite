// src/components/ui/NotificationPopover.tsx
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    date: Date;
    read: boolean;
    link?: string;
}

export interface NotificationPopoverProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
    className?: string;
}

const getIcon = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return <CheckCircle2 className="h-4 w-4 text-success" />;
        case 'warning':
            return <AlertCircle className="h-4 w-4 text-warning" />;
        case 'error':
            return <AlertCircle className="h-4 w-4 text-danger" />;
        default:
            return <Bell className="h-4 w-4 text-primary" />;
    }
};

export function NotificationPopover({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onNotificationClick,
    className,
}: NotificationPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        onNotificationClick?.(notification);
        setIsOpen(false);
    };

    const sortedNotifications = [...notifications].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
    );

    return (
        <div ref={popoverRef} className={cn('relative', className)}>
            {/* Botão de Notificação */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-text-secondary hover:text-text-primary relative"
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Popover de Notificações */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-dropdown w-80 max-h-96 bg-surface border border-border rounded-lg shadow-dropdown overflow-hidden animate-in fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkAllAsRead();
                                }}
                                className="text-xs text-primary hover:text-primary-hover transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Lista de Notificações */}
                    <div className="overflow-y-auto max-h-72 custom-scrollbar">
                        {sortedNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                                <Bell className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            sortedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        'flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors cursor-pointer border-b border-border last:border-b-0',
                                        !notification.read && 'bg-primary/5'
                                    )}
                                >
                                    <div className="mt-0.5">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            'text-sm',
                                            !notification.read ? 'font-semibold text-text-primary' : 'text-text-secondary'
                                        )}>
                                            {notification.title}
                                        </p>
                                        {notification.message && (
                                            <p className="text-xs text-text-muted mt-0.5 truncate">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-text-muted mt-1">
                                            {formatDistanceToNow(notification.date, { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer com View All */}
                    {sortedNotifications.length > 0 && (
                        <div className="border-t border-border px-4 py-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-primary hover:text-primary-hover transition-colors w-full text-center"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}