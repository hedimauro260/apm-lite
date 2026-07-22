// src/pages/Transactions.tsx
import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SummaryCard } from '../components/ui/SummaryCard';
import { GlobalActivityModule } from '../components/modules/GlobalActivityModule';
import { Button } from '../components/ui/Button';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types';
import { Helmet } from 'react-helmet-async';
import { Plus, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Transactions() {
    const { data: portfolio, isLoading: portfolioLoading, refresh: refreshPortfolio } = usePortfolio();
    const { transactions, wallets, isLoading: txLoading, createTransaction, updateTransaction } = useTransactions();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    const isLoading = portfolioLoading || txLoading;

    // ✅ Valores padrão para variações (evita undefined)
    const balanceVariation = portfolio?.balanceVariation ?? 0;
    const inflowsVariation = portfolio?.inflowsVariation ?? 0;
    const outflowsVariation = portfolio?.outflowsVariation ?? 0;
    const transactionsVariation = portfolio?.transactionsVariation ?? 0;

    // ✅ Determinar tendências baseadas nas variações (com fallback para 'neutral')
    const balanceTrend = balanceVariation > 0 ? 'up' : balanceVariation < 0 ? 'down' : 'neutral';
    const inflowsTrend = inflowsVariation > 0 ? 'up' : inflowsVariation < 0 ? 'down' : 'neutral';
    const outflowsTrend = outflowsVariation > 0 ? 'up' : outflowsVariation < 0 ? 'down' : 'neutral';
    const transactionsTrend = transactionsVariation > 0 ? 'up' : transactionsVariation < 0 ? 'down' : 'neutral';

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
            setIsEditModalOpen(true);
        }
    };

    if (isLoading || !portfolio) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-text-muted animate-pulse">Loading transactions...</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <Helmet>
                    <title>Transactions | Asset Portfolio Manager Lite</title>
                    <meta name="description" content="All your wallet transactions in one place" />
                    <meta name="keywords" content="transactions, wallet, balance, track, portfolio" />
                </Helmet>

                {/* 1. PageHeader */}
                <PageHeader
                    title="Transactions"
                    subtitle="All your wallet transactions in one place"
                    actions={
                        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add Transaction
                        </Button>
                    }
                />

                {/* 2. SummaryCards com Sparklines e Variações Dinâmicas */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            title="Total Balance"
                            value={portfolio.totalBalance}
                            variation={balanceVariation}
                            trend={balanceTrend}
                            icon={<DollarSign className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.balance}
                            sparklineColor="text-success"
                        />
                        <SummaryCard
                            title="Total Inflows"
                            value={portfolio.totalInflows}
                            variation={inflowsVariation}
                            trend={inflowsTrend}
                            icon={<ArrowUpRight className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.inflows}
                            sparklineColor="text-primary"
                        />
                        <SummaryCard
                            title="Total Outflows"
                            value={portfolio.totalOutflows}
                            variation={outflowsVariation}
                            trend={outflowsTrend}
                            icon={<ArrowDownRight className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.outflows}
                            sparklineColor="text-danger"
                        />
                        <SummaryCard
                            title="Total Transactions"
                            value={portfolio.totalTransactions}
                            variation={transactionsVariation}
                            trend={transactionsTrend}
                            isCurrency={false}
                            icon={<Activity className="h-5 w-5" />}
                            sparklineData={portfolio.sparklines.transactions}
                            sparklineColor="text-warning"
                        />
                    </div>
                </section>

                {/* 3. Main Content: Global Activity */}
                <section>
                    <GlobalActivityModule
                        usePagination={true}
                        pageSize={20}
                        onAddTransaction={() => setIsAddModalOpen(true)}
                        onEditTransaction={handleEditClick}
                        transactions={transactions}
                        wallets={wallets}
                    />
                </section>
            </div>

            {/* Modals */}
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                wallets={wallets}
                onSubmit={handleAddTransaction}
            />
            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                transaction={editingTx}
                wallets={wallets}
                onSubmit={handleEditTransaction}
            />
        </>
    );
}