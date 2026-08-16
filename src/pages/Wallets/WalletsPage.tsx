import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Button } from "../../components/ui/Button"
import { PageHeader } from "../../components/ui/PageHeader"
import { SummaryCardWallets } from "./SummaryCardWallets"
import { WalletCardExtended } from "./WalletCards"
import { AllTransactions } from "../../components/modules/AllTransactions"
import {
    WalletModal,
    type WalletModalData,
} from "../../components/modals/WalletModal"
import { DeleteWalletModal } from "../../components/modals/DeleteWalletModal"
import {
    AddTransactionModal,
    type AddTransactionData,
} from "../../components/modals/AddTransactionModal"
import { db } from "../../database/db"
import { useLiveQuery } from "dexie-react-hooks"
import { generateId, withWalletBalances } from "../../lib/utils"
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Plus,
    Wallet as WalletIcon,
    type LucideIcon,
} from "lucide-react"
import type { Transaction, TransactionType, Wallet } from "../../types"
import { buildDashboardSeries, weeklySums } from "../Dashboard/dashboardChartData"

interface WalletSummary {
    label: string
    value: number
    secondaryText?: string
    secondaryValue?: number
    color: string
    isCurrency?: boolean
    icon: LucideIcon
}



export default function Wallets() {
    const wallets = useLiveQuery(() => db.wallets.toArray(), [], [])
    const transactions = useLiveQuery(
        () => db.transactions.toArray(),
        [],
        [],
    )
    const [walletModal, setWalletModal] = useState<{
        open: boolean
        mode: "create" | "edit"
        wallet?: Wallet
    }>({ open: false, mode: "create" })
    const [deleteWallet, setDeleteWallet] = useState<Wallet | null>(null)
    const [txModal, setTxModal] = useState<{
        open: boolean
        type: TransactionType
        walletId?: string
    }>({ open: false, type: "deposit" })

    const walletsWithBalance = useMemo(
        () => withWalletBalances(wallets, transactions),
        [wallets, transactions],
    )
    const chartData = useMemo(
        () => buildDashboardSeries(transactions, 7),
        [transactions],
    )
    const weekly = useMemo(() => weeklySums(chartData), [chartData])
    const totalWallets = walletsWithBalance.length
    const totalBalance = walletsWithBalance.reduce(
        (total, wallet) => total + wallet.balance,
        0,
    )
    const totalInflows = transactions
        .filter((t) => t.amount > 0)
        .reduce((total, t) => total + t.amount, 0)
    const totalOutflows = Math.abs(
        transactions
            .filter((t) => t.amount < 0)
            .reduce((total, t) => total + t.amount, 0),
    )
    const totalTransactions = transactions.length

    const assetsCountByWallet = wallets.reduce<Record<string, number>>(
        (acc, wallet) => {
            acc[wallet.id] = wallet.assetIds?.length ?? 0
            return acc
        },
        {},
    )

    const handleAddWallet = () => {
        setWalletModal({ open: true, mode: "create" })
    }

    const handleCreateWallet = async (data: WalletModalData) => {
        const now = new Date().toISOString()
        const wallet: Wallet = {
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
        }
        try {
            await db.wallets.add(wallet)
        } catch (error) {
            console.error("Error adding wallet to DB", error)
        }
        setWalletModal({ open: false, mode: "create" })
    }

    const handleUpdateWallet = async (wallet: Wallet, data: WalletModalData) => {
        const updatedAt = new Date().toISOString()
        const updates: Partial<Wallet> = {
            name: data.name,
            type: data.type,
            color: data.color,
            description: data.description,
            assetIds: data.assetIds,
            updatedAt,
        }
        try {
            await db.wallets.update(wallet.id, updates)
        } catch (error) {
            console.error("Error updating wallet in DB", error)
        }
        setWalletModal({ open: false, mode: "edit" })
    }

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

    const handleQuickAction = (action: string, walletId: string) => {
        setTxModal({
            open: true,
            type: action as TransactionType,
            walletId,
        })
    }

    const handleEditClick = (wallet: Wallet) => {
        setWalletModal({ open: true, mode: "edit", wallet })
    }

    const handleDeleteClick = (wallet: Wallet) => {
        setDeleteWallet(wallet)
    }

    const handleConfirmDelete = async (wallet: Wallet) => {
        try {
            await db.transactions
                .where("walletId")
                .equals(wallet.id)
                .delete()
            await db.wallets.delete(wallet.id)
        } catch (error) {
            console.error("Error deleting wallet from DB", error)
        }
        setDeleteWallet(null)
    }

    const handleToggleStatus = (wallet: Wallet) => {
        console.log("Toggle status placeholder", wallet)
    }

    const walletSummary: WalletSummary[] = [
        {
            label: "Total Wallets",
            value: totalWallets,
            secondaryText: "Active wallets",
            isCurrency: false,
            icon: WalletIcon,
            color: "#7C5CFC",
        },
        {
            label: "Total Balance",
            value: totalBalance,
            secondaryText: "Current portfolio value",
            icon: DollarSign,
            color: "#38BDF8",
        },
        {
            label: "Total Inflows",
            value: totalInflows,
            secondaryValue: weekly.inflows,
            secondaryText: "This week",
            icon: ArrowUpRight,
            color: "#22C55E",
        },
        {
            label: "Total Outflows",
            value: totalOutflows,
            secondaryValue: weekly.outflows,
            secondaryText: "This week",
            icon: ArrowDownRight,
            color: "#EF4444",
        },
        {
            label: "Total Transações",
            value: totalTransactions,
            secondaryText: `${weekly.transactions} this week`,
            isCurrency: false,
            icon: Activity,
            color: "#F59E0B",
        },
    ]

    return (
        <div className="space-y-4 px-4">
            <Helmet>
                <title>Wallets | Asset Portfolio Manager Lite</title>
                <meta
                    name="description"
                    content="Manage your wallets and track balances"
                />
                <meta
                    name="keywords"
                    content="wallets, manage, balance, track, portfolio"
                />
            </Helmet>
            {/* 1. PageHeader */}
            <PageHeader
                title="Wallets"
                subtitle="Manage your wallets and track balances"
                actions={
                    <>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTxModal({ open: true, type: "deposit" })}
                        >
                            <Plus className="h-4 w-4" />
                            Add Transaction
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddWallet}
                        >
                            <Plus className="h-4 w-4" />
                            Add Wallet
                        </Button>
                    </>
                }
            />
            {/* 2. Summary Cards Wallets */}
            <section className="pb-4 border-b border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {walletSummary.map(({ label, icon: Icon, ...card }) => (
                        <SummaryCardWallets
                            key={label}
                            title={
                                <span className="flex flex-col">
                                    <span>{label.split(" ")[0]}</span>
                                    <span>{label.split(" ")[1]}</span>
                                </span>
                            }
                            icon={<Icon className="h-5 w-5" />}
                            {...card}
                        />
                    ))}
                </div>
            </section>
            {/* 3. Wallet Cards Grid */}
            <section>
                {walletsWithBalance.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {walletsWithBalance.map((wallet) => (
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
            {/* 4. All Transactions with pagination */}
            <AllTransactions />
            <WalletModal
                open={walletModal.open}
                mode={walletModal.mode}
                wallet={walletModal.wallet}
                onClose={() => setWalletModal({ open: false, mode: "create" })}
                onSubmit={handleCreateWallet}
                onUpdate={handleUpdateWallet}
            />
            <DeleteWalletModal
                open={deleteWallet !== null}
                wallet={deleteWallet ?? undefined}
                onClose={() => setDeleteWallet(null)}
                onConfirm={handleConfirmDelete}
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