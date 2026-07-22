// src/pages/Assets.tsx
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { AssetMetricCard } from '../components/ui/AssetMetricCard';
import { Button } from '../components/ui/Button';
import { AssetsListView } from '../components/modules/AssetsListView';
import { AssetActivityTable } from '../components/modules/AssetActivityTable';
import { AddAssetModal } from '../components/modals/AddAssetModal';
import { AssetActionModal } from '../components/modals/AssetActionModal';
import { PriceUpdateModal } from '../components/modals/PriceUpdateModal';
import { useAssetsSummary } from '../hooks/useAssetsSummary';
import { useAssets } from '../hooks/useAssets';
import { useWallets } from '../hooks/useWallets';
import { useToast } from '../components/ui/Toast';
import type { AssetMovement, Asset } from '../types';
import { Helmet } from 'react-helmet-async';
import { db } from '../database/db';
import { Plus, Layers, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

export default function Assets() {
    const { toast } = useToast();

    // ===== HOOKS =====
    const {
        totalAssets,
        totalValue,
        bestPnl,
        worstPnl,
        largestAsset,
        isLoading: summaryLoading,
    } = useAssetsSummary();

    const {
        assets,
        isLoading: assetsLoading,
        createAsset,
        // ✅ updateAsset: updateAsset - removido pois não está sendo usado
        deleteAsset,
        updatePrices,
        refresh: refreshAssets,
    } = useAssets();

    const {
        wallets,
        isLoading: walletsLoading,
    } = useWallets();

    // ===== ESTADO LOCAL =====
    const [movements, setMovements] = useState<AssetMovement[]>([]);
    const [isMovementsLoading, setIsMovementsLoading] = useState(true);

    // ===== MODAIS =====
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isPriceUpdateModalOpen, setIsPriceUpdateModalOpen] = useState(false);

    const isLoading = assetsLoading || walletsLoading || summaryLoading || isMovementsLoading;

    // ===== CARREGAR MOVIMENTAÇÕES =====
    useEffect(() => {
        const loadMovements = async () => {
            try {
                const movementsData = await db.assetMovements.toArray();
                setMovements(movementsData);
            } catch (error) {
                console.error('Error loading movements:', error);
                toast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load asset movements',
                });
            } finally {
                setIsMovementsLoading(false);
            }
        };

        loadMovements();
    }, [toast]);

    // ===== HANDLERS =====
    const handleAddAsset = async (data: {
        name: string;
        symbol: string;
        type: string;
        walletId: string;
        quantity: number;
        purchasePrice: number;
        color: string;
        isCustom: boolean;
    }) => {
        try {
            await createAsset(data);
            setIsAddAssetModalOpen(false);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    const handleAssetAction = async (data: {
        assetId: string;
        actionType: 'add' | 'remove';
        quantity: number;
        pricePerUnit: number;
    }) => {
        try {
            const asset = assets.find(a => a.id === data.assetId);
            if (!asset) {
                toast({
                    type: 'error',
                    title: 'Asset not found',
                    message: 'The selected asset could not be found',
                });
                return;
            }

            const wallet = wallets.find(w => w.id === asset.walletId);
            const newQuantity = data.actionType === 'add'
                ? asset.quantity + data.quantity
                : asset.quantity - data.quantity;

            if (newQuantity < 0) {
                toast({
                    type: 'error',
                    title: 'Insufficient quantity',
                    message: 'Cannot remove more than current quantity',
                });
                return;
            }

            const newCurrentValue = newQuantity * data.pricePerUnit;
            const actionCurrentValue = data.quantity * data.pricePerUnit;

            // Criar registro de movimentação
            const newMovement: AssetMovement = {
                id: crypto.randomUUID(),
                assetId: asset.id,
                assetName: asset.name,
                assetSymbol: asset.symbol,
                quantity: data.quantity,
                priceAtAction: data.pricePerUnit,
                currentValue: actionCurrentValue,
                walletId: asset.walletId,
                walletName: wallet?.name || 'Unknown Wallet',
                actionType: data.actionType,
                date: new Date().toISOString(),
            };

            // Transação atômica
            await db.transaction('rw', db.assets, db.assetMovements, async () => {
                await db.assets.update(data.assetId, {
                    quantity: newQuantity,
                    purchasePrice: data.pricePerUnit,
                    currentValue: newCurrentValue,
                    updatedAt: new Date().toISOString(),
                });
                await db.assetMovements.add(newMovement);
            });

            // Recarregar dados
            await refreshAssets();
            const movementsData = await db.assetMovements.toArray();
            setMovements(movementsData);

            toast({
                type: 'success',
                title: 'Asset updated',
                message: `${data.actionType === 'add' ? 'Added' : 'Removed'} ${data.quantity} ${asset.symbol}`,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update asset';
            toast({
                type: 'error',
                title: 'Error',
                message,
            });
        }
    };

    const handleUpdatePrices = async (updates: { assetId: string; newPrice: number }[]) => {
        try {
            await updatePrices(updates);
            setIsPriceUpdateModalOpen(false);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    // ===== HANDLERS PARA ASSETS LIST VIEW =====
    // ✅ Adaptar para receber o Asset completo
    const handleEditAsset = async (asset: Asset) => {
        // Abrir modal de edição com os dados do asset
        // Por enquanto, apenas log
        console.log('Edit asset:', asset);
        // TODO: Implementar modal de edição de asset
    };

    // ✅ Adaptar para receber o Asset completo
    const handleDeleteAsset = async (asset: Asset) => {
        try {
            await deleteAsset(asset.id);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    // ===== RENDER =====
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted animate-pulse">Loading assets...</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <Helmet>
                    <title>Assets | Asset Portfolio Manager Lite</title>
                    <meta name="description" content="Track and manage your portfolio holdings" />
                    <meta name="keywords" content="assets, portfolio, holdings, track, manage" />
                </Helmet>
                {/* 1. PageHeader */}
                <PageHeader
                    title="Assets"
                    subtitle="Track and manage your portfolio holdings"
                    actions={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAddAssetModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Asset
                        </Button>
                    }
                />

                {/* 2. Metric Cards */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <AssetMetricCard
                            label="Total Assets"
                            value={totalAssets}
                            icon={<Layers className="h-5 w-5" />}
                            isCurrency={false}
                        />
                        <AssetMetricCard
                            label="Total Value"
                            value={totalValue}
                            icon={<DollarSign className="h-5 w-5" />}
                        />
                        <AssetMetricCard
                            label="Best PNL"
                            value={bestPnl ? bestPnl.value : 0}
                            subValue={bestPnl ? `${bestPnl.assetName} (+${bestPnl.percentage.toFixed(2)}%)` : 'No data'}
                            icon={<TrendingUp className="h-5 w-5" />}
                            trend="up"
                        />
                        <AssetMetricCard
                            label="Worst PNL"
                            value={worstPnl ? worstPnl.value : 0}
                            subValue={worstPnl ? `${worstPnl.assetName} (${worstPnl.percentage.toFixed(2)}%)` : 'No data'}
                            icon={<TrendingDown className="h-5 w-5" />}
                            trend="down"
                        />
                        <AssetMetricCard
                            label="Largest Asset"
                            value={largestAsset ? largestAsset.assetName : '-'}
                            subValue={largestAsset ? `${largestAsset.percentage.toFixed(2)}% of portfolio` : undefined}
                            icon={<PieChart className="h-5 w-5" />}
                            isCurrency={false}
                        />
                    </div>
                </section>

                {/* 3. Assets List View */}
                <section>
                    <AssetsListView
                        assets={assets}
                        wallets={wallets}
                        totalPortfolioValue={totalValue}
                        onAction={() => setIsActionModalOpen(true)}
                        onUpdatePrices={() => setIsPriceUpdateModalOpen(true)}
                        onEdit={handleEditAsset}      // ✅ Agora recebe Asset
                        onDelete={handleDeleteAsset}  // ✅ Agora recebe Asset
                    />
                </section>

                {/* 4. Asset Activity Table */}
                <section>
                    <AssetActivityTable movements={movements} />
                </section>
            </div>

            {/* ===== MODAIS ===== */}
            <AddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                wallets={wallets}
                assets={assets}
                onSubmit={handleAddAsset}
            />

            <AssetActionModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                assets={assets}
                wallets={wallets}
                onSubmit={handleAssetAction}
            />

            <PriceUpdateModal
                isOpen={isPriceUpdateModalOpen}
                onClose={() => setIsPriceUpdateModalOpen(false)}
                assets={assets}
                onUpdatePrices={handleUpdatePrices}
            />
        </>
    );
}