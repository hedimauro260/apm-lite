import { Link } from 'react-router-dom';
import { type Asset } from '../../types';
import { PRESET_ASSETS } from '../../data/asset-list';
import { formatCurrency, calculatePercentage, aggregateAssetsBySymbol } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AssetsModuleProps {
    assets: Asset[];
    totalPortfolioBalance: number;
    onAddAsset?: () => void;
}

export function AssetsModule({ assets, totalPortfolioBalance, onAddAsset }: AssetsModuleProps) {
    const aggregatedAssets = aggregateAssetsBySymbol(assets);

    // Função para obter o logo do asset
    const getAssetLogo = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.logo || null;
    };

    // Função para obter a cor padrão do asset
    const getAssetColor = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.defaultColor || '#627EEA';
    };

    return (
        <div className="card h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary">Assets</h2>
                <Button variant="primary" size="sm" onClick={onAddAsset}>
                    Add Asset
                </Button>
            </div>

            {/* Content - Lista de Assets */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                <div className="space-y-3">
                    {aggregatedAssets.map((asset) => {
                        const percentage = calculatePercentage(asset.totalValue, totalPortfolioBalance);
                        const logo = getAssetLogo(asset.symbol);
                        const defaultColor = getAssetColor(asset.symbol);
                        return (
                            <div
                                key={asset.symbol}
                                className="flex items-center gap-3 p-2 hover:bg-surface-elevated transition-colors group cursor-pointer"
                            >
                                {/* Logo */}
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-elevated border border-border">
                                    {logo ? (
                                        <img
                                            src={logo}
                                            alt={asset.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                                            style={{ backgroundColor: defaultColor }}
                                        >
                                            {asset.symbol.slice(0, 2)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="w-full flex justify-between min-w-0  gap-1 ">
                                    <div className="w-18 flex flex-col mb-0.5">
                                        <span className="text-sm font-medium text-text-primary truncate">
                                            {asset.name}
                                        </span>
                                        <span className="text-[12px] text-text-muted">{asset.walletCount} wallet{asset.walletCount > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="w-38 flex flex-col">
                                        <span className="text-sm font-semibold text-text-primary">
                                            {formatCurrency(asset.totalValue)}
                                        </span>
                                        <span className="text-[12px] text-text-muted ">{asset.totalQuantity.toFixed(8)} {asset.symbol}</span>

                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-24 flex flex-col justify-center items-end">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-text-muted">{percentage.toFixed(2)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-surface-elevated rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: defaultColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>


                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-3">
                <Link
                    to="/assets"
                    className="flex items-center justify-between text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    <span>View all assets</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}