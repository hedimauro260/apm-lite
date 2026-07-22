// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useWallets } from '../hooks/useWallets';
import { useAssets } from '../hooks/useAssets';
import { useTransactions } from '../hooks/useTransactions';
import { usePortfolio } from '../hooks/usePortfolio';
import { SummaryCard } from '../components/ui/SummaryCard';
import { WalletsModule } from '../components/modules/WalletsModule';
import { AssetsModule } from '../components/modules/AssetsModule';
import { GlobalActivityModule } from '../components/modules/GlobalActivityModule';
import { LiveCryptoPrices } from '../components/modules/LiveCryptoPrices';
import { AddWalletModal } from '../components/modals/AddWalletModal';
import { AddAssetModal } from '../components/modals/AddAssetModal';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';
import { useToast } from '../components/ui/Toast';
import type { Transaction } from '../types';
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import { WELCOME_MESSAGES } from '../data/welcomeMessages';

export default function Dashboard() {
    const { toast } = useToast();

    // ⚡ Usando o novo hook unificado
    const { data: portfolio, isLoading: portfolioLoading, refresh: refreshPortfolio } = usePortfolio();
    const { wallets, isLoading: walletsLoading, createWallet } = useWallets();
    const { assets, isLoading: assetsLoading, createAsset } = useAssets();
    const { transactions, createTransaction, updateTransaction } = useTransactions();

    const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [quickActionType, setQuickActionType] = useState<'deposit' | 'withdraw' | 'transfer' | 'adjust' | undefined>();
    const [quickActionWalletId, setQuickActionWalletId] = useState<string | undefined>();

    const isLoading = portfolioLoading || walletsLoading || assetsLoading;

    // ✅ TOAST DE BOAS-VINDAS DIÁRIO
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastVisitKey = 'apm_last_visit_date';
        const lastVisit = localStorage.getItem(lastVisitKey);

        if (lastVisit !== today) {
            const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
            const message = WELCOME_MESSAGES[randomIndex];

            toast({
                type: 'info',
                title: message.title,
                message: message.message,
                duration: 15000,
            });

            localStorage.setItem(lastVisitKey, today);
        }
    }, [toast]);

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleAddWallet = async (data: any) => {
        await createWallet(data);
        refreshPortfolio();
    };

    const handleAddAsset = async (data: any) => {
        await createAsset(data);
        refreshPortfolio();
    };

    const handleQuickAction = (type: 'deposit' | 'withdraw' | 'transfer' | 'adjust', walletId: string) => {
        setQuickActionType(type);
        setQuickActionWalletId(walletId);
        setIsAddTxModalOpen(true);
    };

    const handleAddTransaction = async (data: any) => {
        await createTransaction(data);
        refreshPortfolio();
    };

    const handleEditTransaction = async (data: Partial<Transaction>) => {
        await updateTransaction(data);
        refreshPortfolio();
    };

    const handleEditClick = (transactionId: string) => {
        const tx = transactions.find((t) => t.id === transactionId);
        if (tx) {
            setEditingTx(tx);
            setIsEditTxModalOpen(true);
        }
    };

    const handleCloseTxModal = () => {
        setIsAddTxModalOpen(false);
        setQuickActionType(undefined);
        setQuickActionWalletId(undefined);
    };

    // ============================================================
    // RENDER
    // ============================================================
    if (isLoading || !portfolio) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted animate-pulse">Loading portfolio data...</p>
            </div>
        );
    }

    // ✅ Determinar tendências baseadas nas variações
    const balanceTrend = portfolio.balanceVariation >= 0 ? 'up' : 'down';
    const inflowsTrend = portfolio.inflowsVariation >= 0 ? 'up' : 'down';
    const outflowsTrend = portfolio.outflowsVariation >= 0 ? 'up' : 'down';
    const transactionsTrend = portfolio.transactionsVariation >= 0 ? 'up' : 'down';

    return (
        <>
            <div className="space-y-6">
                {/* 1. Portfolio Summary */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            title="Total Balance"
                            value={portfolio.totalBalance}
                            variation={portfolio.balanceVariation}
                            trend={balanceTrend}
                            icon={<WalletIcon className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.balance}
                            sparklineColor="text-success"
                        />
                        <SummaryCard
                            title="Total Inflows"
                            value={portfolio.totalInflows}
                            variation={portfolio.inflowsVariation}
                            trend={inflowsTrend}
                            icon={<ArrowUpRight className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.inflows}
                            sparklineColor="text-primary"
                        />
                        <SummaryCard
                            title="Total Outflows"
                            value={portfolio.totalOutflows}
                            variation={portfolio.outflowsVariation}
                            trend={outflowsTrend}
                            icon={<ArrowDownRight className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.outflows}
                            sparklineColor="text-danger"
                        />
                        <SummaryCard
                            title="Total Transactions"
                            value={portfolio.totalTransactions}
                            variation={portfolio.transactionsVariation}
                            trend={transactionsTrend}
                            isCurrency={false}
                            icon={<Activity className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.transactions}
                            sparklineColor="text-warning"
                        />
                    </div>
                </section>

                {/* 2. Wallets + Assets Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <WalletsModule
                            wallets={wallets}
                            totalPortfolioBalance={portfolio.totalBalance}
                            onAddWallet={() => setIsAddWalletModalOpen(true)}
                            onQuickAction={handleQuickAction}
                        />
                    </div>
                    <div className="lg:col-span-1 h-95">
                        <AssetsModule
                            assets={assets}
                            totalPortfolioBalance={portfolio.totalBalance}
                            onAddAsset={() => setIsAddAssetModalOpen(true)}
                        />
                    </div>
                </section>

                {/* 3. Live Crypto Prices */}
                <LiveCryptoPrices />

                {/* 4. Global Activity */}
                <GlobalActivityModule
                    onAddTransaction={() => setIsAddTxModalOpen(true)}
                    onEditTransaction={handleEditClick}
                />
            </div>

            {/* Modals */}
            <AddWalletModal
                isOpen={isAddWalletModalOpen}
                onClose={() => setIsAddWalletModalOpen(false)}
                onSubmit={handleAddWallet}
            />
            <AddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                wallets={wallets}
                assets={assets}
                onSubmit={handleAddAsset}
            />
            <AddTransactionModal
                isOpen={isAddTxModalOpen}
                onClose={handleCloseTxModal}
                wallets={wallets}
                onSubmit={handleAddTransaction}
                initialType={quickActionType}
                initialWalletId={quickActionWalletId}
            />
            <EditTransactionModal
                isOpen={isEditTxModalOpen}
                onClose={() => setIsEditTxModalOpen(false)}
                transaction={editingTx}
                wallets={wallets}
                onSubmit={handleEditTransaction}
            />
        </>
    );
}