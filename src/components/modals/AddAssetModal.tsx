import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Plus, X, ChevronDown } from 'lucide-react';
import { type PresetAsset, searchPresetAssets } from '../../data/asset-list';
import type { Wallet, Asset } from '../../types';
import { cn } from '../../lib/utils';

export interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    assets: Asset[]; // ⚡ NOVA PROP: Lista de assets existentes para validação
    onSubmit: (data: {
        name: string;
        symbol: string;
        type: string;
        walletId: string;
        quantity: number;
        purchasePrice: number;
        color: string;
        isCustom: boolean;
    }) => void;
}

const COLOR_OPTIONS = [
    '#F7931A',
    '#627EEA',
    '#9945FF',
    '#F3BA2F',
    '#10B981',
    '#EF4444',
    '#3B82F6',
    '#8B5CF6',
];

type ModalStep = 'search' | 'form';

export function AddAssetModal({ isOpen, onClose, wallets, assets, onSubmit }: AddAssetModalProps) {
    const [step, setStep] = useState<ModalStep>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PresetAsset[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<PresetAsset | null>(null);

    const [walletId, setWalletId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [color, setColor] = useState('#627EEA');
    const [customName, setCustomName] = useState('');
    const [customSymbol, setCustomSymbol] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                resetForm();
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const results = searchPresetAssets(searchQuery);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const resetForm = () => {
        setStep('search');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedPreset(null);
        setWalletId('');
        setQuantity('');
        setPurchasePrice('');
        setColor('#627EEA');
        setCustomName('');
        setCustomSymbol('');
        setErrors({});
    };

    const handlePresetSelect = (preset: PresetAsset) => {
        setSelectedPreset(preset);
        setColor(preset.defaultColor || '#627EEA');
        setStep('form');
    };

    const handleCreateCustom = () => {
        setSelectedPreset(null);
        setColor(COLOR_OPTIONS[0]);
        setStep('form');
    };

    const handleBackToSearch = () => {
        setStep('search');
        setSelectedPreset(null);
    };

    // ⚡ VALIDAÇÃO: Verificar se o asset já existe na wallet selecionada
    const checkDuplicateAsset = (symbol: string, walletId: string): boolean => {
        return assets.some(
            asset => asset.symbol === symbol && asset.walletId === walletId
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!walletId) newErrors.walletId = 'Please select a wallet';
        if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
        if (!purchasePrice || parseFloat(purchasePrice) <= 0) newErrors.purchasePrice = 'Valid price is required';

        if (!selectedPreset) {
            if (!customName.trim()) newErrors.customName = 'Asset name is required';
            if (!customSymbol.trim()) newErrors.customSymbol = 'Asset symbol is required';
        }

        // ⚡ VALIDAÇÃO DE DUPLICAÇÃO
        const symbolToCheck = selectedPreset ? selectedPreset.symbol : customSymbol.trim().toUpperCase();
        if (walletId && symbolToCheck && checkDuplicateAsset(symbolToCheck, walletId)) {
            newErrors.walletId = `${symbolToCheck} already exists in this wallet`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const isCustom = !selectedPreset;
        onSubmit({
            name: selectedPreset ? selectedPreset.name : customName.trim(),
            symbol: selectedPreset ? selectedPreset.symbol : customSymbol.trim().toUpperCase(),
            type: selectedPreset ? selectedPreset.type : 'other',
            walletId,
            quantity: parseFloat(quantity),
            purchasePrice: parseFloat(purchasePrice),
            color,
            isCustom,
        });

        resetForm();
        onClose();
    };

    const isExpanded = step === 'form';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isExpanded ? (selectedPreset ? 'Add Asset' : 'Create Custom Asset') : 'Search Asset'}
            size={isExpanded ? 'lg' : 'md'}
            className="transition-all duration-300"
        >
            {step === 'search' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search by name or symbol (e.g., BTC, Bitcoin)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    </div>

                    {searchResults.length > 0 && (
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                            {searchResults.map((asset) => {
                                const logo = asset.logo;
                                return (
                                    <button
                                        key={asset.id}
                                        onClick={() => handlePresetSelect(asset)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-elevated border border-border">
                                            {logo ? (
                                                <img
                                                    src={logo}
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                                                    style={{ backgroundColor: asset.defaultColor || '#627EEA' }}
                                                >
                                                    {asset.symbol.slice(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-text-primary">{asset.name}</p>
                                            <p className="text-sm text-text-muted">{asset.symbol}</p>
                                        </div>
                                        <Plus className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {searchQuery.trim() && searchResults.length === 0 && (
                        <div className="text-center py-8 text-text-muted">
                            <p>No assets found matching "{searchQuery}"</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border">
                        <button
                            onClick={handleCreateCustom}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-text-secondary hover:text-primary"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Custom Asset</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg border border-border">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-elevated border border-border">
                            {selectedPreset?.logo ? (
                                <img
                                    src={selectedPreset.logo}
                                    alt={selectedPreset.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                                    style={{ backgroundColor: color }}
                                >
                                    {selectedPreset ? selectedPreset.symbol.slice(0, 2) : customSymbol.slice(0, 2) || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-text-primary">
                                {selectedPreset ? selectedPreset.name : customName || 'Custom Asset'}
                            </h3>
                            <p className="text-sm text-text-muted">
                                {selectedPreset ? selectedPreset.symbol : customSymbol || 'SYMBOL'}
                            </p>
                        </div>
                        {!selectedPreset && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleBackToSearch}>
                                Change
                            </Button>
                        )}
                    </div>

                    {!selectedPreset && (
                        <div className="space-y-4">
                            <Input
                                label="Asset Name"
                                placeholder="e.g., My Custom Token"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                error={errors.customName}
                            />
                            <Input
                                label="Symbol"
                                placeholder="e.g., CMT"
                                value={customSymbol}
                                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                                error={errors.customSymbol}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Wallet *
                        </label>
                        <div className="relative">
                            <select
                                value={walletId}
                                onChange={(e) => {
                                    setWalletId(e.target.value);
                                    if (errors.walletId) setErrors({ ...errors, walletId: '' });
                                }}
                                className={cn(
                                    'w-full h-10 px-4 bg-surface border border-border rounded-md text-text-primary appearance-none',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    errors.walletId && 'border-danger focus-visible:ring-danger'
                                )}
                            >
                                <option value="">Select a wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {wallet.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                        </div>
                        {errors.walletId && <p className="text-sm text-danger mt-1">{errors.walletId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Initial Quantity *"
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                if (errors.quantity) setErrors({ ...errors, quantity: '' });
                            }}
                            error={errors.quantity}
                        />
                        <Input
                            label="Purchase Price (USD) *"
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={purchasePrice}
                            onChange={(e) => {
                                setPurchasePrice(e.target.value);
                                if (errors.purchasePrice) setErrors({ ...errors, purchasePrice: '' });
                            }}
                            error={errors.purchasePrice}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">
                            Asset Color
                        </label>
                        <div className="flex gap-3 flex-wrap">
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {selectedPreset ? 'Add Asset' : 'Create Asset'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}