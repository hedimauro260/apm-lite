// src/components/layout/Header/NotificationsMenu.tsx
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useToast } from "../../ui/Toast";
import { useNotifications } from "./useNotifications";
import {
  NOTIFICATION_STYLES,
  NOTIFICATION_TOAST_TYPE,
  type AppNotification,
} from "./notificationTypes";

const MAX_DISPLAYED = 30;

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function NotificationsMenu() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: AppNotification) => {
    markRead(notification.id);
    setIsOpen(false);
    toast({
      type: NOTIFICATION_TOAST_TYPE[notification.type],
      title: notification.title,
      message: notification.message,
    });
  };

  const handleMarkAllRead = () => {
    markAllRead();
    setIsOpen(false);
  };

  const displayed = notifications.slice(0, MAX_DISPLAYED);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "p-2 rounded-lg hover:bg-surface-elevated transition-colors relative",
          isOpen && "bg-surface-elevated"
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-surface border border-border rounded-lg shadow-dropdown overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-xs font-semibold text-text-primary">Notifications</h2>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary-hover transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-text-muted">
                No notifications
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {displayed.map((notification) => {
                  const style = NOTIFICATION_STYLES[notification.type];
                  const Icon = style.icon;

                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                          notification.read
                            ? "hover:bg-surface-elevated/50"
                            : "bg-surface-elevated/50 hover:bg-surface-elevated"
                        )}
                      >
                        <div
                          className={cn(
                            "shrink-0 p-2 rounded-lg",
                            style.bgClass,
                            style.iconClass
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-xs font-medium text-text-primary",
                              notification.read && "text-text-secondary"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-text-muted leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-text-muted/70">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {notifications.length > MAX_DISPLAYED && (
            <div className="px-4 py-2 border-t border-border text-center text-[10px] text-text-muted">
              Showing {MAX_DISPLAYED} of {notifications.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}