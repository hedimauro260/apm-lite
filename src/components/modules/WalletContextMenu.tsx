import { useState, useRef, useEffect } from 'react';
import { type Wallet } from '../../types';
//import { cn } from '../../lib/utils';
import { MoreVertical, Pencil, Trash2, Power } from 'lucide-react';

export interface WalletContextMenuProps {
    wallet: Wallet;
    onEdit: (wallet: Wallet) => void;
    onDelete: (wallet: Wallet) => void;
    onToggleStatus: (wallet: Wallet) => void;
}

export function WalletContextMenu({ wallet, onEdit, onDelete, onToggleStatus }: WalletContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-md transition-colors"
                title="More options"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-elevated border border-border rounded-lg shadow-lg py-1 z-50">
                    <button
                        onClick={() => handleAction(() => onEdit(wallet))}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleAction(() => onToggleStatus(wallet))}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left"
                    >
                        <Power className="h-4 w-4" />
                        {wallet.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                        onClick={() => handleAction(() => onDelete(wallet))}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors text-left"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}