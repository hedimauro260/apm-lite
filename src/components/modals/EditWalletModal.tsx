import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Wallet, WalletType } from '../../types';
import { cn } from '../../lib/utils';
import { X, ChevronDown } from 'lucide-react';

export interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSubmit: (data: Partial<Wallet>) => void;
}

const WALLET_TYPES: { value: WalletType; label: string; color: string }[] = [
  { value: 'main', label: 'Main', color: '#3B82F6' }, // ✅ Tipar com WalletType
  { value: 'exchange', label: 'Exchange', color: '#F59E0B' },
  { value: 'cold', label: 'Cold Wallet', color: '#10B981' },
  { value: 'hot', label: 'Hot Wallet', color: '#3B82F6' },
  { value: 'micro', label: 'Micro Wallet', color: '#8B5CF6' },
  { value: 'bank', label: 'Bank', color: '#EC4899' },
  { value: 'cash', label: 'Cash', color: '#14B8A6' },
  { value: 'other', label: 'Other', color: '#6B7280' },
] as const;

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

export function EditWalletModal({ isOpen, onClose, wallet, onSubmit }: EditWalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('main'); // ✅ Tipar com WalletType
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (wallet && isOpen) {
      setName(wallet.name);
      setType(wallet.type);
      setDescription(wallet.description || '');
      setColor(wallet.color || '#3B82F6');
      setStatus(wallet.status);
      setErrors({});
    }
  }, [wallet, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: 'Wallet name is required' });
      return;
    }

    if (!wallet) return;

    onSubmit({
      id: wallet.id,
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      color,
      status,
    });

    onClose();
  };

  if (!wallet) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Wallet" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wallet Name */}
        <Input
          label="Wallet Name"
          placeholder="e.g., Main Wallet, Savings"
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
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-all',
                  type === walletType.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-border-light'
                )}
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
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
          <div className="flex gap-3 flex-wrap">
            {COLOR_OPTIONS.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={cn(
                  'w-10 h-10 rounded-full transition-all',
                  color === colorOption
                    ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary scale-110'
                    : 'hover:scale-105'
                )}
                style={{ backgroundColor: colorOption }}
              >
                {color === colorOption && <X className="h-5 w-5 text-white mx-auto" />}
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}