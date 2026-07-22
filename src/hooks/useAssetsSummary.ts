import { useEffect, useState } from 'react';
import { db } from '../database/db';
import { type Asset } from '../types';

export interface AssetsSummaryData {
    totalAssets: number;
    totalValue: number;
    bestPnl: { assetName: string; value: number; percentage: number } | null;
    worstPnl: { assetName: string; value: number; percentage: number } | null;
    largestAsset: { assetName: string; percentage: number } | null;
    isLoading: boolean;
}

export function useAssetsSummary(): AssetsSummaryData {
    const [data, setData] = useState<AssetsSummaryData>({
        totalAssets: 0,
        totalValue: 0,
        bestPnl: null,
        worstPnl: null,
        largestAsset: null,
        isLoading: true,
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const assets: Asset[] = await db.assets.toArray();

                // 1. Total de Assets adicionados
                const uniqueSymbols = new Set(assets.map(a => a.symbol));
                const totalAssets = uniqueSymbols.size;

                // 2. Valor Total do Portfolio
                const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

                // ⚡ Agrupar assets por símbolo para calcular PNL corretamente
                const groupedBySymbol = new Map<string, Asset[]>();
                assets.forEach(asset => {
                    const existing = groupedBySymbol.get(asset.symbol);
                    if (existing) {
                        existing.push(asset);
                    } else {
                        groupedBySymbol.set(asset.symbol, [asset]);
                    }
                });

                let bestPnl: AssetsSummaryData['bestPnl'] = null;
                let worstPnl: AssetsSummaryData['worstPnl'] = null;
                let largestAsset: AssetsSummaryData['largestAsset'] = null;

                groupedBySymbol.forEach((assetList) => {
                    const totalPurchaseValue = assetList.reduce((sum, a) => sum + (a.quantity * a.purchasePrice), 0);
                    const totalCurrentValue = assetList.reduce((sum, a) => sum + a.currentValue, 0);

                    const pnl = totalCurrentValue - totalPurchaseValue;
                    const pnlPercentage = totalPurchaseValue > 0 ? (pnl / totalPurchaseValue) * 100 : 0;

                    // Melhor PNL
                    if (!bestPnl || pnl > bestPnl.value) {
                        bestPnl = { assetName: assetList[0].name, value: pnl, percentage: pnlPercentage };
                    }

                    // Pior PNL
                    if (!worstPnl || pnl < worstPnl.value) {
                        worstPnl = { assetName: assetList[0].name, value: pnl, percentage: pnlPercentage };
                    }

                    // Maior Participação
                    if (totalValue > 0) {
                        const participation = (totalCurrentValue / totalValue) * 100;
                        if (!largestAsset || participation > largestAsset.percentage) {
                            largestAsset = { assetName: assetList[0].name, percentage: participation };
                        }
                    }
                });

                setData({
                    totalAssets,
                    totalValue,
                    bestPnl,
                    worstPnl,
                    largestAsset,
                    isLoading: false,
                });
            } catch (error) {
                console.error('Error fetching assets summary:', error);
                setData((prev) => ({ ...prev, isLoading: false }));
            }
        }

        fetchData();
    }, []);

    return data;
}