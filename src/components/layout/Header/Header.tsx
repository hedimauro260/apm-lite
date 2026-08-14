// Header.tsx
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { ArrowRightToLine, CloudUpload, ChevronDown } from "lucide-react";
import { HeaderDate } from "./HeaderDate";
import { NotificationsMenu } from "./NotificationsMenu";
import { BackupRestoreModal } from "../../modals/BackupRestoreModal";

export interface HeaderProps {
    className?: string;
    onToggleSidebar?: () => void;
    isOpen?: boolean;
}

export function Header({
    className,
    onToggleSidebar,
    isOpen = true,
}: HeaderProps) {
    // Largura do sidebar: 264px quando aberto, 72px quando fechado
    const sidebarWidth = isOpen ? 264 : 72;
    const [isBackupOpen, setIsBackupOpen] = useState(false);

    return (
        <header
            className={cn(
                "fixed top-0 z-30 px-4 h-14 flex items-center justify-between",
                "bg-background/80 border-b border-border backdrop-blur-md",
                "transition-all duration-300",
                className
            )}
            style={{
                width: `calc(100% - ${sidebarWidth}px)`,
                left: `${sidebarWidth}px`
            }}
        >
            {/* Toggle sidebar */}
            <button
                onClick={onToggleSidebar}
                className="flex items-center p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                aria-label="Toggle sidebar"
            >
                <ArrowRightToLine className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isOpen ? "rotate-180" : "rotate-0"
                )} />
            </button>

            {/* Date */}
            <HeaderDate />

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsBackupOpen(true)}
                    className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                    aria-label="Backup and restore"
                >
                    <CloudUpload className="h-5 w-5 text-text-muted" />
                </button>
                <NotificationsMenu />
                <div className="flex items-center gap-1 ml-2 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-primary font-semibold text-sm">
                        HM
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                </div>
            </div>
            <BackupRestoreModal open={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
        </header>
    );
}