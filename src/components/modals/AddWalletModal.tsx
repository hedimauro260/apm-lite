import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';

export interface AddWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        type: string;
        description?: string;
        color: string;
    }) => void;
}

const WALLET_TYPES = [
    { value: 'exchange', label: 'Exchange', color: '#F59E0B' },
    { value: 'cold', label: 'Cold Wallet', color: '#10B981' },
    { value: 'hot', label: 'Hot Wallet', color: '#3B82F6' },
    { value: 'micro', label: 'Micro Wallet', color: '#8B5CF6' },
    { value: 'bank', label: 'Bank', color: '#EC4899' },
    { value: 'cash', label: 'Cash', color: '#14B8A6' },
    { value: 'other', label: 'Other', color: '#6B7280' },
];

const COLOR_OPTIONS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#EF4444', // Red
    '#6B7280', // Gray
];

export function AddWalletModal({ isOpen, onClose, onSubmit }: AddWalletModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('hot');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [errors, setErrors] = useState<{ name?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: 'Wallet name is required' });
            return;
        }

        onSubmit({
            name: name.trim(),
            type,
            description: description.trim() || undefined,
            color,
        });

        // Reset form
        setName('');
        setType('hot');
        setDescription('');
        setColor('#3B82F6');
        setErrors({});
        onClose();
    };

    //const selectedTypeColor = WALLET_TYPES.find(t => t.value === type)?.color || '#3B82F6';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Wallet" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Wallet Name */}
                <Input
                    label="Wallet Name"
                    placeholder="e.g., Main Wallet, Savings, Trading"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({});
                    }}
                    error={errors.name}
                />

                {/* Wallet Type */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Wallet Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {WALLET_TYPES.map((walletType) => (
                            <button
                                key={walletType.value}
                                type="button"
                                onClick={() => setType(walletType.value)}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${type === walletType.value
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-surface hover:border-border-light'
                                    }`}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: walletType.color }}
                                />
                                <span className="text-sm text-text-primary">{walletType.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <Input
                    label="Description (optional)"
                    placeholder="Add a description for this wallet"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Color Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        Wallet Color
                    </label>
                    <div className="flex gap-3">
                        {COLOR_OPTIONS.map((colorOption) => (
                            <button
                                key={colorOption}
                                type="button"
                                onClick={() => setColor(colorOption)}
                                className={`w-10 h-10 rounded-full transition-all ${color === colorOption
                                    ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary scale-110'
                                    : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: colorOption }}
                            >
                                {color === colorOption && (
                                    <X className="h-5 w-5 text-white mx-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Create Wallet
                    </Button>
                </div>
            </form>
        </Modal>
    );
}