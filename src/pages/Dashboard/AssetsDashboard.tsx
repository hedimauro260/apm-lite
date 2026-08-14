import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { type Asset } from '../../types';
import { aggregateAssetsBySymbol, calculatePercentage, formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';

const assetMeta: Record<string, { logo?: string; defaultColor: string }> = {
    BTC: { defaultColor: '#F7931A' },
    ETH: { defaultColor: '#627EEA' },
    SOL: { defaultColor: '#14F195' },
    USDT: { defaultColor: '#26A17B' },
    USD: { defaultColor: '#22C55E' },
};

const DEFAULT_ASSET_COLOR = '#627EEA';

export function AssetsDashboard() {
    const assets = useLiveQuery(() => db.assets.toArray(), [], []);
    const positions = useLiveQuery(() => db.assetPositions.toArray(), [], []);

    const assetRows: Asset[] = useMemo(() => {
        const rows: Asset[] = [];
        positions.forEach((position) => {
            const asset = assets.find((a) => a.id === position.assetId);
            if (!asset) return;
            rows.push({
                id: position.id,
                name: asset.name,
                symbol: asset.symbol,
                type: asset.type,
                quantity: position.quantity,
                purchasePrice: position.purchasePrice,
                currentValue: position.quantity * asset.currentPrice,
                walletId: position.walletId,
                createdAt: position.createdAt,
                updatedAt: position.updatedAt,
            });
        });
        return rows;
    }, [assets, positions]);

    const totalPortfolioBalance = assetRows.reduce((total, asset) => total + asset.currentValue, 0);
    const aggregatedAssets = aggregateAssetsBySymbol(assetRows);

    const handleAddAsset = () => {
        console.log('Add asset action placeholder');
    };

    const getAssetLogo = (symbol: string) => {
        const entity = assets.find((a) => a.symbol === symbol);
        return entity?.logo ?? assetMeta[symbol]?.logo ?? null;
    };

    const getAssetColor = (symbol: string) => {
        const entity = assets.find((a) => a.symbol === symbol);
        return entity?.color ?? assetMeta[symbol]?.defaultColor ?? DEFAULT_ASSET_COLOR;
    };

    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h2 className="text-xs font-semibold text-text-primary">Assets</h2>
                <Button variant="primary" size="xs" onClick={handleAddAsset}>
                    Add Asset
                </Button>
            </div>

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

                                <div className="w-full flex justify-between min-w-0 gap-1">
                                    <div className="w-18 flex flex-col mb-0.5">
                                        <span className="text-sm font-medium text-text-primary truncate">
                                            {asset.name}
                                        </span>
                                        <span className="text-[12px] text-text-muted">
                                            {asset.walletCount} wallet{asset.walletCount > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="w-38 flex flex-col">
                                        <span className="text-sm font-semibold text-text-primary">
                                            {formatCurrency(asset.totalValue)}
                                        </span>
                                        <span className="text-[12px] text-text-muted">
                                            {asset.totalQuantity.toFixed(8)} {asset.symbol}
                                        </span>
                                    </div>

                                    <div className="w-24 flex flex-col justify-center items-end">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-text-muted">
                                                {percentage.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-surface-elevated rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(percentage, 100)}%`,
                                                    backgroundColor: defaultColor,
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

            <div className="border-t border-border px-6 py-3">
                <Link
                    to="/assets"
                    className="flex items-center justify-between text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    <span>View all assets</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
