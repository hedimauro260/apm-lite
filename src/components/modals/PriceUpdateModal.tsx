import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { type Asset } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { RefreshCw, Check } from 'lucide-react';

export interface PriceUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    onUpdatePrices: (updates: { assetId: string; newPrice: number }[]) => void;
}

interface PriceUpdate {
    assetId: string;
    newPrice: string;
    changed: boolean;
}

export function PriceUpdateModal({ isOpen, onClose, assets, onUpdatePrices }: PriceUpdateModalProps) {
    const [updates, setUpdates] = useState<PriceUpdate[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Inicializar com preços atuais
            const initialUpdates = assets.map(asset => ({
                assetId: asset.id,
                newPrice: asset.purchasePrice.toString(),
                changed: false,
            }));
            setUpdates(initialUpdates);
        }
    }, [isOpen, assets]);

    const handlePriceChange = (assetId: string, newPrice: string) => {
        setUpdates(prev => prev.map(u =>
            u.assetId === assetId ? { ...u, newPrice, changed: true } : u
        ));
    };

    const handleUpdateAll = () => {
        const changedUpdates = updates.filter(u => u.changed && parseFloat(u.newPrice) > 0);
        if (changedUpdates.length === 0) return;

        const priceUpdates = changedUpdates.map(u => ({
            assetId: u.assetId,
            newPrice: parseFloat(u.newPrice),
        }));

        onUpdatePrices(priceUpdates);
        onClose();
    };

    const handleUpdateSingle = (assetId: string) => {
        const update = updates.find(u => u.assetId === assetId);
        if (!update || !update.changed) return;

        onUpdatePrices([{
            assetId: update.assetId,
            newPrice: parseFloat(update.newPrice),
        }]);

        setUpdates(prev => prev.map(u =>
            u.assetId === assetId ? { ...u, changed: false } : u
        ));
    };

    const hasChanges = updates.some(u => u.changed);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Price Update Center" size="lg">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">
                        Update prices for your assets. Changes will affect current values.
                    </p>
                    {hasChanges && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleUpdateAll}
                        >
                            <Check className="h-4 w-4" />
                            Update All
                        </Button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                    {updates.map((update) => {
                        const asset = assets.find(a => a.id === update.assetId);
                        if (!asset) return null;

                        return (
                            <div
                                key={update.assetId}
                                className="flex items-center gap-4 p-3 bg-surface-elevated border border-border rounded-lg"
                            >
                                {/* Asset Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {asset.name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {asset.symbol} • {asset.quantity.toFixed(8)} units
                                    </p>
                                </div>

                                {/* Current Value */}
                                <div className="text-right">
                                    <p className="text-xs text-text-muted">Current</p>
                                    <p className="text-sm font-semibold text-text-primary">
                                        {formatCurrency(asset.currentValue)}
                                    </p>
                                </div>

                                {/* New Price Input */}
                                <div className="w-32">
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="New price"
                                        value={update.newPrice}
                                        onChange={(e) => handlePriceChange(update.assetId, e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>

                                {/* Update Button */}
                                {update.changed && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleUpdateSingle(update.assetId)}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}