// src/pages/Wallets.tsx
import { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SummaryCard } from '../components/ui/SummaryCard';
import { Button } from '../components/ui/Button';
import { WalletCardExtended } from '../components/modules/WalletCardExtended';
import { GlobalActivityModule } from '../components/modules/GlobalActivityModule';
import { AddWalletModal } from '../components/modals/AddWalletModal';
import { EditWalletModal } from '../components/modals/EditWalletModal';
import { DeleteWalletModal } from '../components/modals/DeleteWalletModal';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';
import { useWalletsSummary } from '../hooks/useWalletsSummary';
import { useWallets } from '../hooks/useWallets';
import { useTransactions } from '../hooks/useTransactions';
import { useAssets } from '../hooks/useAssets';
import { usePortfolio } from '../hooks/usePortfolio';
import type { Wallet } from '../types';
import { Helmet } from 'react-helmet-async';
import { Plus, Wallet as WalletIcon, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function Wallets() {
    // ===== HOOKS =====
    const {
        totalWallets,
        totalBalance,
        totalInflows,
        totalOutflows,
        totalTransactions,
        isLoading: summaryLoading,
    } = useWalletsSummary();

    const {
        wallets,
        isLoading: walletsLoading,
        createWallet,
        updateWallet,
        deleteWallet,
        toggleStatus,
    } = useWallets();

    const {
        transactions,
        wallets: allWallets,
        isLoading: transactionsLoading,
        createTransaction,
        updateTransaction,
    } = useTransactions();

    const {
        assets,
        isLoading: assetsLoading,
    } = useAssets();

    const isLoading = walletsLoading || transactionsLoading || assetsLoading || summaryLoading;

    // ✅ Hook do portfólio para obter as variações
    const { data: portfolioData } = usePortfolio();

    // ✅ Valores padrão para variações (evita undefined)
    const balanceVariation = portfolioData?.balanceVariation ?? 0;
    const inflowsVariation = portfolioData?.inflowsVariation ?? 0;
    const outflowsVariation = portfolioData?.outflowsVariation ?? 0;
    const transactionsVariation = portfolioData?.transactionsVariation ?? 0;

    // ✅ Determinar tendências baseadas nas variações
    const balanceTrend = balanceVariation > 0 ? 'up' : balanceVariation < 0 ? 'down' : 'neutral';
    const inflowsTrend = inflowsVariation > 0 ? 'up' : inflowsVariation < 0 ? 'down' : 'neutral';
    const outflowsTrend = outflowsVariation > 0 ? 'up' : outflowsVariation < 0 ? 'down' : 'neutral';
    const transactionsTrend = transactionsVariation > 0 ? 'up' : transactionsVariation < 0 ? 'down' : 'neutral';

    // ===== MODAIS =====
    const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
    const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
    const [isDeleteWalletModalOpen, setIsDeleteWalletModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);

    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [quickActionType, setQuickActionType] = useState<'deposit' | 'withdraw' | 'transfer' | 'adjust' | undefined>();
    const [quickActionWalletId, setQuickActionWalletId] = useState<string | undefined>();

    const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

    // ===== DADOS DERIVADOS =====
    const assetsCountByWallet = useMemo(() => {
        const counts: Record<string, number> = {};
        assets.forEach((asset) => {
            counts[asset.walletId] = (counts[asset.walletId] || 0) + 1;
        });
        return counts;
    }, [assets]);

    // ===== HANDLERS DE WALLET =====
    const handleAddWallet = async (data: {
        name: string;
        type: string;
        description?: string;
        color: string;
    }) => {
        try {
            await createWallet({
                name: data.name,
                type: data.type,
                description: data.description,
                color: data.color,
            });
            setIsAddWalletModalOpen(false);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    const handleEditWallet = async (data: Partial<Wallet>) => {
        try {
            if (!data.id) return;
            await updateWallet(data.id, data);
            setIsEditWalletModalOpen(false);
            setEditingWallet(null);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    const handleDeleteWallet = async (walletId: string) => {
        try {
            await deleteWallet(walletId);
            setIsDeleteWalletModalOpen(false);
            setDeletingWallet(null);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    const handleToggleStatus = async (wallet: Wallet) => {
        await toggleStatus(wallet.id);
    };

    // ===== HANDLERS DE TRANSAÇÃO =====
    const handleQuickAction = (type: string, walletId: string) => {
        const validTypes = ['deposit', 'withdraw', 'transfer', 'adjust'] as const;
        if (validTypes.includes(type as any)) {
            setQuickActionType(type as typeof quickActionType);
            setQuickActionWalletId(walletId);
            setIsAddTxModalOpen(true);
        }
    };

    const handleAddTransaction = async (data: any) => {
        try {
            await createTransaction(data);
            setIsAddTxModalOpen(false);
            setQuickActionType(undefined);
            setQuickActionWalletId(undefined);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    const handleEditTransactionClick = (transactionId: string) => {
        setEditingTransactionId(transactionId);
        setIsEditTxModalOpen(true);
    };

    const handleSaveEditTransaction = async (data: Partial<any>) => {
        try {
            await updateTransaction(data);
            setIsEditTxModalOpen(false);
            setEditingTransactionId(null);
        } catch (error) {
            // Erro já tratado no hook
        }
    };

    // ===== HANDLERS DE MODAL =====
    const handleEditClick = (wallet: Wallet) => {
        setEditingWallet(wallet);
        setIsEditWalletModalOpen(true);
    };

    const handleDeleteClick = (wallet: Wallet) => {
        setDeletingWallet(wallet);
        setIsDeleteWalletModalOpen(true);
    };

    const handleCloseTxModal = () => {
        setIsAddTxModalOpen(false);
        setQuickActionType(undefined);
        setQuickActionWalletId(undefined);
    };

    // ===== RENDER =====
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted animate-pulse">Loading wallets...</p>
            </div>
        );
    }

    const editingTransaction = transactions.find(t => t.id === editingTransactionId) || null;

    return (
        <>
            <div className="space-y-6">
                <Helmet>
                    <title>Wallets | Asset Portfolio Manager Lite</title>
                    <meta name="description" content="Manage your wallets and track balances" />
                    <meta name="keywords" content="wallets, manage, balance, track, portfolio" />
                </Helmet>

                {/* 1. PageHeader */}
                <PageHeader
                    title="Wallets"
                    subtitle="Manage your wallets and track balances"
                    actions={
                        <Button variant="primary" size="sm" onClick={() => setIsAddWalletModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add Wallet
                        </Button>
                    }
                />

                {/* 2. SummaryCards */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <SummaryCard
                            title="Total Wallets"
                            value={totalWallets}
                            isCurrency={false}
                            icon={<WalletIcon className="h-5 w-5" />}
                            showSparkline={false}
                        />
                        <SummaryCard
                            title="Total Balance"
                            value={totalBalance}
                            variation={balanceVariation}
                            trend={balanceTrend}
                            icon={<DollarSign className="h-5 w-5" />}
                            showSparkline={false}
                        />
                        <SummaryCard
                            title="Total Inflows"
                            value={totalInflows}
                            variation={inflowsVariation}
                            trend={inflowsTrend}
                            icon={<ArrowUpRight className="h-5 w-5" />}
                            showSparkline={false}
                        />
                        <SummaryCard
                            title="Total Outflows"
                            value={totalOutflows}
                            variation={outflowsVariation}
                            trend={outflowsTrend}
                            icon={<ArrowDownRight className="h-5 w-5" />}
                            showSparkline={false}
                        />
                        <SummaryCard
                            title="Total Transactions"
                            value={totalTransactions}
                            variation={transactionsVariation}
                            trend={transactionsTrend}
                            isCurrency={false}
                            icon={<Activity className="h-5 w-5" />}
                            showSparkline={false}
                        />
                    </div>
                </section>

                {/* 3. Wallet Cards Grid */}
                <section>
                    {wallets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {wallets.map((wallet) => (
                                <WalletCardExtended
                                    key={wallet.id}
                                    wallet={wallet}
                                    totalPortfolioBalance={totalBalance}
                                    assetsCount={assetsCountByWallet[wallet.id] || 0}
                                    transactions={transactions}
                                    onAction={handleQuickAction}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 border border-dashed border-border rounded-lg text-center text-text-muted">
                            No wallets found. Create your first wallet to get started.
                        </div>
                    )}
                </section>

                {/* 4. Global Activity com Paginação */}
                <section>
                    <GlobalActivityModule
                        onAddTransaction={() => setIsAddTxModalOpen(true)}
                        onEditTransaction={handleEditTransactionClick}
                        usePagination={true}
                        pageSize={20}
                    />
                </section>
            </div>

            {/* ===== MODAIS DE WALLET ===== */}
            <AddWalletModal
                isOpen={isAddWalletModalOpen}
                onClose={() => setIsAddWalletModalOpen(false)}
                onSubmit={handleAddWallet}
            />

            <EditWalletModal
                isOpen={isEditWalletModalOpen}
                onClose={() => {
                    setIsEditWalletModalOpen(false);
                    setEditingWallet(null);
                }}
                wallet={editingWallet}
                onSubmit={handleEditWallet}
            />

            <DeleteWalletModal
                isOpen={isDeleteWalletModalOpen}
                onClose={() => {
                    setIsDeleteWalletModalOpen(false);
                    setDeletingWallet(null);
                }}
                wallet={deletingWallet}
                onConfirm={handleDeleteWallet}
            />

            {/* ===== MODAIS DE TRANSAÇÃO ===== */}
            <AddTransactionModal
                isOpen={isAddTxModalOpen}
                onClose={handleCloseTxModal}
                wallets={allWallets}
                onSubmit={handleAddTransaction}
                initialType={quickActionType}
                initialWalletId={quickActionWalletId}
            />

            <EditTransactionModal
                isOpen={isEditTxModalOpen}
                onClose={() => {
                    setIsEditTxModalOpen(false);
                    setEditingTransactionId(null);
                }}
                transaction={editingTransaction}
                wallets={allWallets}
                onSubmit={handleSaveEditTransaction}
            />
        </>
    );
}