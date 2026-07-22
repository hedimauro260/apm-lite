import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import type { Asset } from '../types';
import { useToast } from '../components/ui/Toast';

export interface CreateAssetData {
    name: string;
    symbol: string;
    type: string;
    walletId: string;
    quantity: number;
    purchasePrice: number;
    color: string;
    isCustom: boolean;
}

export interface PriceUpdate {
    assetId: string;
    newPrice: number;
}

export interface UseAssetsReturn {
    assets: Asset[];
    isLoading: boolean;
    error: string | null;
    createAsset: (data: CreateAssetData) => Promise<void>;
    updateAsset: (id: string, data: Partial<Asset>) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
    updatePrices: (updates: PriceUpdate[]) => Promise<void>;
    checkDuplicate: (symbol: string, walletId: string) => boolean;
    refresh: () => Promise<void>;
}

export function useAssets(): UseAssetsReturn {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadAssets = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await db.assets.toArray();
            setAssets(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load assets';
            setError(message);
            console.error('Error loading assets:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    // Validação de duplicação
    const checkDuplicate = (symbol: string, walletId: string): boolean => {
        return assets.some(
            (asset) => asset.symbol === symbol && asset.walletId === walletId
        );
    };

    // Create
    const createAsset = async (data: CreateAssetData) => {
        try {
            // Validação de duplicação
            if (checkDuplicate(data.symbol, data.walletId)) {
                toast({
                    type: 'error',
                    title: 'Duplicate asset',
                    message: `${data.symbol} already exists in this wallet`,
                });
                return;
            }

            const currentValue = data.quantity * data.purchasePrice;

            const newAsset: Asset = {
                id: crypto.randomUUID(),
                name: data.name,
                symbol: data.symbol,
                type: data.type as any,
                quantity: data.quantity,
                purchasePrice: data.purchasePrice,
                currentValue,
                walletId: data.walletId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.assets.add(newAsset);
            await loadAssets();

            toast({
                type: 'success',
                title: 'Asset added',
                message: `${data.quantity} ${data.symbol} has been tracked successfully`,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create asset';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Update
    const updateAsset = async (id: string, data: Partial<Asset>) => {
        try {
            await db.assets.update(id, {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            await loadAssets();

            toast({
                type: 'success',
                title: 'Asset updated',
                message: 'Asset has been updated successfully',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update asset';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Delete
    const deleteAsset = async (id: string) => {
        try {
            await db.assets.delete(id);
            await loadAssets();

            toast({
                type: 'success',
                title: 'Asset deleted',
                message: 'Asset has been removed successfully',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete asset';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Update Prices (em massa)
    const updatePrices = async (updates: PriceUpdate[]) => {
        try {
            await db.transaction('rw', db.assets, async () => {
                for (const update of updates) {
                    const asset = assets.find((a) => a.id === update.assetId);
                    if (!asset) continue;

                    const newCurrentValue = asset.quantity * update.newPrice;

                    await db.assets.update(update.assetId, {
                        purchasePrice: update.newPrice,
                        currentValue: newCurrentValue,
                        updatedAt: new Date().toISOString(),
                    });
                }
            });

            await loadAssets();

            toast({
                type: 'success',
                title: 'Prices updated',
                message: `${updates.length} asset(s) updated successfully`,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update prices';
            toast({ type: 'error', title: 'Error', message });
            throw err;
        }
    };

    // Refresh manual
    const refresh = async () => {
        await loadAssets();
    };

    return {
        assets,
        isLoading,
        error,
        createAsset,
        updateAsset,
        deleteAsset,
        updatePrices,
        checkDuplicate,
        refresh,
    };
}