import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Asset, Wallet } from '../../types';
import { cn } from '../../lib/utils';
import { Plus, Minus } from 'lucide-react';

export interface AssetActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    wallets: Wallet[]; // ✅ Adicionar wallets
    onSubmit: (data: {
        assetId: string;
        actionType: 'add' | 'remove';
        quantity: number;
        pricePerUnit: number;
    }) => void;
}

export function AssetActionModal({ isOpen, onClose, assets, wallets, onSubmit }: AssetActionModalProps) {
    const [assetId, setAssetId] = useState('');
    const [actionType, setActionType] = useState<'add' | 'remove'>('add');
    const [quantity, setQuantity] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedAsset = assets.find(a => a.id === assetId);
    const selectedWallet = wallets.find(w => w.id === selectedAsset?.walletId);

    //const selectedAsset = assets.find(a => a.id === assetId);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setAssetId('');
        setActionType('add');
        setQuantity('');
        setPricePerUnit('');
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!assetId) newErrors.assetId = 'Please select an asset';
        if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
        if (!pricePerUnit || parseFloat(pricePerUnit) <= 0) newErrors.pricePerUnit = 'Valid price is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            assetId,
            actionType,
            quantity: parseFloat(quantity),
            pricePerUnit: parseFloat(pricePerUnit),
        });

        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Asset Action" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asset Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Select Asset *
                    </label>
                    <select
                        value={assetId}
                        onChange={(e) => {
                            setAssetId(e.target.value);
                            if (errors.assetId) setErrors({ ...errors, assetId: '' });
                        }}
                        className={cn(
                            'w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            errors.assetId && 'border-danger focus-visible:ring-danger'
                        )}
                    >
                        <option value="">Choose an asset</option>
                        {assets.map((asset) => {
                            const wallet = wallets.find(w => w.id === asset.walletId);
                            return (
                                <option key={asset.id} value={asset.id}>
                                    {asset.name} ({asset.symbol}) - {wallet?.name || 'Unknown Wallet'}
                                </option>
                            );
                        })}
                    </select>
                    {errors.assetId && <p className="text-sm text-danger mt-1">{errors.assetId}</p>}
                </div>

                {/* Mostrar wallet selecionada */}
                {selectedAsset && selectedWallet && (
                    <div className="p-3 bg-surface-elevated border border-border rounded-lg">
                        <p className="text-xs text-text-muted mb-1">Selected Wallet</p>
                        <p className="text-sm font-medium text-text-primary">{selectedWallet.name}</p>
                        <p className="text-xs text-text-muted mt-1">
                            Current: {selectedAsset.quantity.toFixed(8)} {selectedAsset.symbol}
                        </p>
                    </div>
                )}

                {/* Action Type */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Action Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setActionType('add')}
                            className={cn(
                                'flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                                actionType === 'add'
                                    ? 'border-success bg-success/10 text-success'
                                    : 'border-border bg-surface hover:border-border-light'
                            )}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm font-medium">Add</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActionType('remove')}
                            className={cn(
                                'flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                                actionType === 'remove'
                                    ? 'border-danger bg-danger/10 text-danger'
                                    : 'border-border bg-surface hover:border-border-light'
                            )}
                        >
                            <Minus className="h-4 w-4" />
                            <span className="text-sm font-medium">Remove</span>
                        </button>
                    </div>
                </div>

                {/* Quantity */}
                <Input
                    label="Quantity *"
                    type="number"
                    step="any"
                    placeholder="0.00000000"
                    value={quantity}
                    onChange={(e) => {
                        setQuantity(e.target.value);
                        if (errors.quantity) setErrors({ ...errors, quantity: '' });
                    }}
                    error={errors.quantity}
                    helperText="Use 8 decimal places for crypto assets"
                />

                {/* Price Per Unit */}
                <Input
                    label="Price per Unit (USD) *"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={pricePerUnit}
                    onChange={(e) => {
                        setPricePerUnit(e.target.value);
                        if (errors.pricePerUnit) setErrors({ ...errors, pricePerUnit: '' });
                    }}
                    error={errors.pricePerUnit}
                />

                {/* Preview */}
                {quantity && pricePerUnit && (
                    <div className="p-4 bg-surface-elevated rounded-lg border border-border">
                        <p className="text-sm text-text-muted mb-1">Total Value</p>
                        <p className="text-2xl font-bold text-text-primary">
                            ${(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant={actionType === 'add' ? 'primary' : 'danger'}>
                        {actionType === 'add' ? 'Add Asset' : 'Remove Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}