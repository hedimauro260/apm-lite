// src/components/layout/Header/Actions.tsx
import { CloudUpload, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Dropdown, DropdownItem, DropdownTrigger } from '../../ui/Dropdown';
import { NotificationPopover } from '../../ui/NotificationPopover';
import { getInitials } from '../../../lib/utils';
import type { Notification } from '../../../hooks/useNotifications';

export interface ActionsProps {
    notifications: Notification[];
    unreadCount: number;
    userName: string;
    onBackup: () => void;
    onLogout: () => void;
    onProfile?: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

export function Actions({
    notifications,
    unreadCount,
    userName,
    onBackup,
    onLogout,
    onProfile,
    onMarkAsRead,
    onMarkAllAsRead,
    onNotificationClick,
}: ActionsProps) {
    const initials = getInitials(userName);

    return (
        <div className="flex items-center gap-2">
            {/* Backup / Restore */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onBackup}
                className="text-text-secondary hover:text-text-primary"
                title="Backup / Restore"
            >
                <CloudUpload className="h-5 w-5" />
            </Button>

            {/* ✅ Notifications com Popover */}
            <NotificationPopover
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onNotificationClick={onNotificationClick}
            />

            {/* Profile Dropdown */}
            <Dropdown
                trigger={
                    <DropdownTrigger className="ml-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {initials}
                        </div>
                    </DropdownTrigger>
                }
                align="right"
            >
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary">{userName}</p>
                    <p className="text-xs text-text-muted">user@apm-lite.com</p>
                </div>
                <DropdownItem onClick={onProfile}>
                    <User className="h-4 w-4" /> Profile
                </DropdownItem>
                <DropdownItem onClick={() => { }}>
                    <Settings className="h-4 w-4" /> Settings
                </DropdownItem>
                <DropdownItem onClick={onLogout} className="text-danger hover:bg-danger/10">
                    <LogOut className="h-4 w-4" /> Logout
                </DropdownItem>
            </Dropdown>
        </div>
    );
}