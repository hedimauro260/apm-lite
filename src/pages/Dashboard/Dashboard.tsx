// src/pages/Dashboard/Dashboard.tsx
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { WalletsDashboard } from "./WalletsDashboard";
import { AssetsDashboard } from "./AssetsDashboard";
import { LiveCryptoPrices } from './LiveCryptoPrices';
import { GlobalActivityDashboard } from "./GlobalActivityDashboard";
import { buildDashboardSeries, weeklySums } from "./dashboardChartData";
import {
    WalletModal,
    type WalletModalData,
} from "../../components/modals/WalletModal";
import {
    AddTransactionModal,
    type AddTransactionData,
} from "../../components/modals/AddTransactionModal";
import { db } from "../../database/db";
import { generateId, withWalletBalances } from "../../lib/utils";
import type { Transaction, TransactionType, Wallet as WalletType } from "../../types";
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";

function queryOrNull<T>(promise: Promise<T>): Promise<T | null> {
    return promise.catch((error) => {
        console.error("Error loading transactions", error);
        return null;
    });
}

export default function Dashboard() {
    const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
    const [txModal, setTxModal] = useState<{
        open: boolean
        type: TransactionType
        walletId?: string
    }>({ open: false, type: "deposit" });

    const transactionsResult = useLiveQuery(
        () => queryOrNull(db.transactions.toArray()),
        []
    );
    const transactions = Array.isArray(transactionsResult) ? transactionsResult : [];

    const walletsResult = useLiveQuery(
        () => queryOrNull(db.wallets.toArray()),
        []
    );
    const wallets = Array.isArray(walletsResult) ? walletsResult : [];

    const walletsWithBalance = useMemo(
        () => withWalletBalances(wallets, transactions),
        [wallets, transactions],
    );

    const chartData = useMemo(() => buildDashboardSeries(transactions, 7), [transactions]);
    const weekly = useMemo(() => weeklySums(chartData), [chartData]);

    const totalBalance = walletsWithBalance.reduce((sum, wallet) => sum + wallet.balance, 0);
    const totalInflows = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalOutflows = Math.abs(
        transactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0),
    );
    const totalTransactions = transactions.length;

    const handleCreateWallet = async (data: WalletModalData) => {
        const now = new Date().toISOString()
        const wallet: WalletType = {
            id: generateId(),
            name: data.name,
            type: data.type,
            balance: 0,
            status: "active",
            color: data.color,
            description: data.description,
            assetIds: data.assetIds,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await db.wallets.add(wallet);
        } catch (error) {
            console.error("Error adding wallet to DB", error);
        }
        setIsAddWalletOpen(false);
    };

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
            createdAt: now,
            updatedAt: now,
        }
        try {
            await db.transactions.add(transaction)
        } catch (error) {
            console.error("Error adding transaction to DB", error)
        }
        setTxModal({ open: false, type: "deposit" })
    };

    return (
        <div className="px-4">
            <div className="pb-4 space-y-4 border-b border-border">
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            title="Total Balance"
                            value={totalBalance}
                            secondaryText="Current portfolio value"
                            icon={<WalletIcon className="h-4 w-4" />}
                            data={chartData.balance}
                            color="#7C5CFC"
                        />
                        <SummaryCard
                            title="Total Inflows"
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
            </div>
            {/* Wallets + Assets Row  */}
            <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <WalletsDashboard
                        wallets={walletsWithBalance}
                        onAddWallet={() => setIsAddWalletOpen(true)}
                        onQuickAction={(type, walletId) =>
                            setTxModal({ open: true, type, walletId })
                        }
                    />
                </div>
                <div className="lg:col-span-1 h-90">
                    <AssetsDashboard />
                </div>
            </section>
            {/* 3. Live Crypto Prices */}
            <LiveCryptoPrices />
            {/* 4. Global Activity */}
            <GlobalActivityDashboard />
            <WalletModal
                open={isAddWalletOpen}
                mode="create"
                onClose={() => setIsAddWalletOpen(false)}
                onSubmit={handleCreateWallet}
            />
            <AddTransactionModal
                open={txModal.open}
                wallets={walletsWithBalance}
                defaultType={txModal.type}
                defaultWalletId={txModal.walletId}
                onClose={() => setTxModal({ open: false, type: "deposit" })}
                onSubmit={handleAddTransaction}
            />
        </div>
    )
}