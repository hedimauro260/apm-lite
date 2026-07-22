import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Asset, Wallet } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { PRESET_ASSETS } from '../../data/asset-list';
import { Button } from '../ui/Button';
import { ChevronDown, MoreVertical, Pencil, Trash2, List, Grid3x3 } from 'lucide-react'; // ⚡ Mantidos para o menu

export interface AssetsListViewProps {
    assets: Asset[];
    wallets: Wallet[];
    totalPortfolioValue: number;
    onAction: () => void; // ⚡ Corrigido: agora é apenas () => void
    onUpdatePrices: () => void;
    onEdit: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
}

export function AssetsListView({
    assets,
    wallets,
    totalPortfolioValue,
    onAction,
    onUpdatePrices,
    onEdit,
    onDelete,
}: AssetsListViewProps) {
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filterAsset, setFilterAsset] = useState('all');

    // ⚡ Estado para o menu de contexto
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Agrupar assets por símbolo
    const groupedAssets = useMemo(() => {
        const grouped = new Map<string, Asset[]>();

        assets.forEach(asset => {
            const existing = grouped.get(asset.symbol);
            if (existing) {
                existing.push(asset);
            } else {
                grouped.set(asset.symbol, [asset]);
            }
        });

        return grouped;
    }, [assets]);

    // Calcular totais por símbolo
    const aggregatedData = useMemo(() => {
        const data = Array.from(groupedAssets.entries()).map(([symbol, assetList]) => {
            const totalQuantity = assetList.reduce((sum, a) => sum + a.quantity, 0);
            const totalPurchaseValue = assetList.reduce((sum, a) => sum + (a.quantity * a.purchasePrice), 0);
            const totalCurrentValue = assetList.reduce((sum, a) => sum + a.currentValue, 0);
            const walletCount = new Set(assetList.map(a => a.walletId)).size;
            const participation = totalPortfolioValue > 0 ? (totalCurrentValue / totalPortfolioValue) * 100 : 0;

            return {
                symbol,
                name: assetList[0].name,
                totalQuantity,
                totalPurchaseValue,
                totalCurrentValue,
                walletCount,
                participation,
                assets: assetList,
            };
        });

        // Ordenar por participação (maior para menor)
        return data.sort((a, b) => b.participation - a.participation);
    }, [groupedAssets, totalPortfolioValue]);

    // Filtrar assets
    const filteredData = useMemo(() => {
        if (filterAsset === 'all') return aggregatedData;
        return aggregatedData.filter(d => d.symbol === filterAsset);
    }, [aggregatedData, filterAsset]);

    const getAssetLogo = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.logo || null;
    };

    const getAssetColor = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.defaultColor || '#627EEA';
    };

    const toggleExpand = (symbol: string) => {
        setExpandedAssetId(expandedAssetId === symbol ? null : symbol);
        setOpenMenuId(null); // Fechar menu ao expandir
    };

    return (
        <div className="card">
            {/* Header com Filtros e Ações */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <select
                        value={filterAsset}
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Assets</option>
                        {aggregatedData.map(d => (
                            <option key={d.symbol} value={d.symbol}>
                                {d.name} ({d.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {/* ⚡ Agora onAction é () => void, compatível com onClick */}
                    <Button variant="secondary" size="sm" onClick={onAction}>
                        Action
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onUpdatePrices}>
                        Update Prices
                    </Button>
                    <div className="flex items-center gap-1 ml-4 pl-4 border-l border-border">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 rounded-md transition-colors',
                                viewMode === 'list'
                                    ? 'bg-primary text-white'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                            )}
                            title="List view"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-2 rounded-md transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-primary text-white'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                            )}
                            title="Grid view (coming soon)"
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-surface-elevated">
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Purchase Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Current Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Wallets</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Participation</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                    No assets found
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((data) => {
                                const isExpanded = expandedAssetId === data.symbol;
                                const pnl = data.totalCurrentValue - data.totalPurchaseValue;
                                const pnlPercentage = data.totalPurchaseValue > 0
                                    ? (pnl / data.totalPurchaseValue) * 100
                                    : 0;

                                return (
                                    <React.Fragment key={data.symbol}>
                                        {/* Linha Principal */}
                                        <tr
                                            onClick={() => toggleExpand(data.symbol)}
                                            className="hover:bg-surface-elevated/50 transition-colors cursor-pointer"
                                        >
                                            {/* Asset Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-elevated border border-border">
                                                        {getAssetLogo(data.symbol) ? (
                                                            <img
                                                                src={getAssetLogo(data.symbol)!}
                                                                alt={data.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                                                                style={{ backgroundColor: getAssetColor(data.symbol) }}
                                                            >
                                                                {data.symbol.slice(0, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">{data.name}</p>
                                                        <p className="text-xs text-text-muted">{data.symbol}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-text-primary">
                                                    {data.totalQuantity.toFixed(8)} {data.symbol}
                                                </span>
                                            </td>

                                            {/* Purchase Value */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-text-secondary">
                                                    {formatCurrency(data.totalPurchaseValue)}
                                                </span>
                                            </td>

                                            {/* Current Value */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="text-sm font-semibold text-text-primary">
                                                        {formatCurrency(data.totalCurrentValue)}
                                                    </span>
                                                    <div className={cn(
                                                        'text-xs font-medium',
                                                        pnl >= 0 ? 'text-success' : 'text-danger'
                                                    )}>
                                                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercentage.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Wallets */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-lg">🏦</span>
                                                    <span className="text-sm text-text-primary">{data.walletCount}</span>
                                                </div>
                                            </td>

                                            {/* Participation */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden max-w-25">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${data.participation}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-text-secondary">
                                                        {data.participation.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions & Menu */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* ⚡ Menu de Contexto Implementado */}
                                                    <div ref={menuRef} className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === data.symbol ? null : data.symbol);
                                                            }}
                                                            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>

                                                        {openMenuId === data.symbol && (
                                                            <div className="absolute right-0 top-full mt-1 w-32 bg-surface-elevated border border-border rounded-lg shadow-lg py-1 z-50">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onEdit(data.assets[0]); // Edita o primeiro registro do grupo
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left"
                                                                >
                                                                    <Pencil className="h-4 w-4" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDelete(data.assets[0]); // Deleta o primeiro registro do grupo
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors text-left"
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <ChevronDown className={cn(
                                                        'h-4 w-4 text-text-muted transition-transform',
                                                        isExpanded && 'rotate-180'
                                                    )} />
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Linha Expandida (Accordion) */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 bg-surface-elevated/30">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                                                Asset PNL:
                                                            </span>
                                                            <span className={cn(
                                                                'text-sm font-bold',
                                                                pnl >= 0 ? 'text-success' : 'text-danger'
                                                            )}>
                                                                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercentage.toFixed(2)}%)
                                                            </span>
                                                        </div>

                                                        {data.assets.map((asset) => {
                                                            const wallet = wallets.find(w => w.id === asset.walletId);
                                                            const assetPnl = asset.currentValue - (asset.quantity * asset.purchasePrice);
                                                            const assetPnlPercentage = asset.purchasePrice > 0
                                                                ? (assetPnl / (asset.quantity * asset.purchasePrice)) * 100
                                                                : 0;

                                                            return (
                                                                <div
                                                                    key={asset.id}
                                                                    className="flex items-center gap-4 p-3 bg-surface border border-border rounded-lg"
                                                                >
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-text-primary">
                                                                            {wallet?.name || 'Unknown Wallet'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-mono text-text-primary">
                                                                            {asset.quantity.toFixed(8)} {asset.symbol}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-text-muted">Purchase</p>
                                                                        <p className="text-sm text-text-secondary">
                                                                            {formatCurrency(asset.quantity * asset.purchasePrice)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-text-muted">Current</p>
                                                                        <p className="text-sm font-semibold text-text-primary">
                                                                            {formatCurrency(asset.currentValue)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right min-w-20">
                                                                        <span className={cn(
                                                                            'text-sm font-bold',
                                                                            assetPnl >= 0 ? 'text-success' : 'text-danger'
                                                                        )}>
                                                                            {assetPnl >= 0 ? '+' : ''}{assetPnlPercentage.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}