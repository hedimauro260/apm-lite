import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { AllTransactions } from "../../components/modules/AllTransactions";
import {
    AddTransactionModal,
    type AddTransactionData,
} from "../../components/modals/AddTransactionModal";
import { Plus, Wallet, ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../database/db";
import { generateId, withWalletBalances } from "../../lib/utils";
import type { Transaction, TransactionType } from "../../types";
import { buildDashboardSeries, weeklySums } from "../Dashboard/dashboardChartData";

export default function Transactions() {
    const transactions = useLiveQuery(() => db.transactions.toArray(), [], []);
    const wallets = useLiveQuery(() => db.wallets.toArray(), [], []);

    const chartData = useMemo(() => buildDashboardSeries(transactions, 7), [transactions]);
    const weekly = useMemo(() => weeklySums(chartData), [chartData]);

    const totalBalance = withWalletBalances(wallets, transactions).reduce(
        (sum, wallet) => sum + wallet.balance,
        0,
    );
    const totalInflows = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalOutflows = Math.abs(
        transactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0),
    );
    const totalTransactions = transactions.length;

    const [txModal, setTxModal] = useState<{
        open: boolean
        type: TransactionType
    }>({ open: false, type: "deposit" });

    const handleAddTransaction = async (data: AddTransactionData) => {
        const now = new Date().toISOString()
        const sign =
            data.type === "withdraw" || (data.type === "adjust" && data.direction === "remove")
                ? -1
                : 1

        const transaction: Transaction = {
            id: generateId(),
            walletId: data.walletId,
            relatedWalletId: data.relatedWalletId,
            type: data.type,
            amount: data.amount * sign,
            status: data.status,
            date: data.date,
            description: data.description,
            website: data.website,
            countsTowardsGoals: data.countsTowardsGoals ?? true,
            createdAt: now,
            updatedAt: now,
        }
        try {
            await db.transactions.add(transaction)
        } catch (error) {
            console.error("Error adding transaction to DB", error)
        }
        setTxModal({ open: false, type: "deposit" })
    }

    return (
        <div className="space-y-4 px-4">
            <Helmet>
                <title>Transactions | Asset Portfolio Manager Lite</title>
                <meta
                    name="description"
                    content="All your wallet transactions in one place"
                />
                <meta
                    name="keywords"
                    content="transactions, wallet, balance, track, portfolio"
                />
            </Helmet>
            {/* 1. PageHeader */}
            <PageHeader
                title="Transactions"
                subtitle="All your wallet transactions in one place"
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setTxModal({ open: true, type: "deposit" })}
                    >
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                }
            />
            {/* 2. SummaryCards com sparklines */}
            <section className="pb-4 border-b border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Balance"
                        value={totalBalance}
                        secondaryText="Current portfolio value"
                        icon={<Wallet className="h-4 w-4" />}
                        data={chartData.balance}
                        color="#7C5CFC"
                    />
                    <SummaryCard
                        title="Total Inflowse"
                        value={totalInflows}
                        secondaryValue={weekly.inflows}
                        secondaryText="This week"
                        icon={<ArrowUpRight className="h-4 w-4" />}
                        data={chartData.inflows}
                        color="#22C55E"
                    />
                    <SummaryCard
                        title="Total Outflows"
                        value={totalOutflows}
                        secondaryValue={weekly.outflows}
                        secondaryText="This week"
                        icon={<ArrowDownRight className="h-4 w-4" />}
                        data={chartData.outflows}
                        color="#EF4444"
                    />
                    <SummaryCard
                        title="Total Transactions"
                        value={totalTransactions}
                        secondaryText={`${weekly.transactions} this week`}
                        icon={<Activity className="h-4 w-4" />}
                        isCurrency={false}
                        data={chartData.transactions}
                        color="#38BDF8"
                    />
                </div>
            </section>
            {/* 3. Main Content: Global Activity */}
            <AllTransactions />
            <AddTransactionModal
                open={txModal.open}
                wallets={wallets}
                defaultType={txModal.type}
                onClose={() => setTxModal({ open: false, type: "deposit" })}
                onSubmit={handleAddTransaction}
            />
        </div>
    )
}