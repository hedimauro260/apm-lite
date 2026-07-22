// src/components/layout/Header/Header.tsx
import { cn } from '../../../lib/utils';
import { DatePicker } from './DatePicker';
import { Actions } from './Actions';
import type { Notification } from '../../../hooks/useNotifications';

export interface HeaderProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    activeDates?: string[];
    onActiveDateClick?: (date: Date) => void;
    notifications: Notification[];
    unreadCount: number;
    userName: string;
    onBackup: () => void;
    onLogout: () => void;
    onProfile?: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
    className?: string;
}

export function Header({
    selectedDate,
    onDateChange,
    activeDates,
    onActiveDateClick,
    notifications,
    unreadCount,
    userName,
    onBackup,
    onLogout,
    onProfile,
    onMarkAsRead,
    onMarkAllAsRead,
    onNotificationClick,
    className,
}: HeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md overflow-visible',
                className
            )}
        >
            <DatePicker
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                activeDates={activeDates}
                onActiveDateClick={onActiveDateClick}
            />

            <Actions
                notifications={notifications}
                unreadCount={unreadCount}
                userName={userName}
                onBackup={onBackup}
                onLogout={onLogout}
                onProfile={onProfile}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onNotificationClick={onNotificationClick}
            />
        </header>
    );
}