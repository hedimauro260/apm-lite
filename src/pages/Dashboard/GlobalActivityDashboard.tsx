import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    ChevronRight,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { type Transaction } from '../../types';
import { cn, formatCurrency, generateId } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
    AddTransactionModal,
    type AddTransactionData,
} from '../../components/modals/AddTransactionModal';
import {
    EditTransactionModal,
    type EditTransactionData,
} from '../../components/modals/EditTransactionModal';
import { db } from '../../database/db';
import { useLiveQuery } from 'dexie-react-hooks';

type DisplayType = Transaction['type'] | 'transfer_in' | 'transfer_out';

interface ActivityRow extends Transaction {
    displayType: DisplayType;
    walletName: string;
    originalId: string;
}

const RECENT_ACTIVITY_LIMIT = 20;

export function GlobalActivityDashboard() {
    const [filterWallet, setFilterWallet] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterTime, setFilterTime] = useState('30');
    const [searchQuery, setSearchQuery] = useState('');

    const transactions = useLiveQuery(() => db.transactions.toArray(), [], []);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const wallets = useLiveQuery(() => db.wallets.toArray(), [], []);

    const handleAddTransaction = async (data: AddTransactionData) => {
        const now = new Date().toISOString();
        const sign =
            data.type === 'withdraw' ||
            (data.type === 'adjust' && data.direction === 'remove')
                ? -1
                : 1;

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
        };
        try {
            await db.transactions.add(transaction);
        } catch (error) {
            console.error('Error adding transaction to DB', error);
        }
        setIsAddOpen(false);
    };

    const handleUpdateTransaction = async (
        transaction: Transaction,
        data: EditTransactionData
    ) => {
        const updates: Partial<Transaction> = {
            amount: data.amount,
            status: data.status,
            date: data.date,
            description: data.description,
            website: data.website,
            updatedAt: new Date().toISOString(),
        };
        try {
            await db.transactions.update(transaction.id, updates);
        } catch (error) {
            console.error('Error updating transaction in DB', error);
        }
        setEditingTransaction(null);
    };

    const handleEditTransactionClick = (transactionId: string) => {
        const transaction = transactions.find((t) => t.id === transactionId);
        if (transaction) setEditingTransaction(transaction);
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            await db.transactions.delete(transactionId);
        } catch (error) {
            console.error('Error deleting transaction from DB', error);
        }
    };

    const rows = useMemo(() => {
        return transactions.map<ActivityRow>((transaction) => {
            const wallet = wallets.find((item) => item.id === transaction.walletId);
            const displayType =
                transaction.type === 'transfer'
                    ? transaction.amount >= 0
                        ? 'transfer_in'
                        : 'transfer_out'
                    : transaction.type;

            return {
                ...transaction,
                displayType,
                walletName: wallet?.name || 'Unknown Wallet',
                originalId: transaction.id,
            };
        });
    }, [transactions, wallets]);

    const filteredRows = useMemo(() => {
        const now = new Date();
        const daysAgo = new Date(now.getTime() - Number(filterTime) * 24 * 60 * 60 * 1000);
        const query = searchQuery.trim().toLowerCase();

        return rows
            .filter((row) => filterWallet === 'all' || row.walletId === filterWallet)
            .filter((row) => filterType === 'all' || row.displayType === filterType)
            .filter((row) => new Date(row.date) >= daysAgo)
            .filter((row) => {
                if (!query) return true;

                return (
                    row.walletName.toLowerCase().includes(query) ||
                    row.description?.toLowerCase().includes(query) ||
                    row.website?.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filterTime, filterType, filterWallet, rows, searchQuery]);

    const displayedRows = filteredRows.slice(0, RECENT_ACTIVITY_LIMIT);

    const getTypeIcon = (type: DisplayType) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownRight className="h-4 w-4 text-success" />;
            case 'withdraw':
                return <ArrowUpRight className="h-4 w-4 text-danger" />;
            case 'transfer_in':
            case 'transfer_out':
                return <ArrowLeftRight className="h-4 w-4 text-primary" />;
            case 'adjust':
                return <AlertCircle className="h-4 w-4 text-warning" />;
            default:
                return null;
        }
    };

    const getTypeColor = (type: DisplayType) => {
        switch (type) {
            case 'deposit':
            case 'transfer_in':
                return 'text-success';
            case 'withdraw':
            case 'transfer_out':
                return 'text-danger';
            default:
                return 'text-text-primary';
        }
    };

    const getStatusClassName = (status: Transaction['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-success/10 text-success';
            case 'pending':
                return 'bg-warning/10 text-warning';
            case 'failed':
                return 'bg-danger/10 text-danger';
            default:
                return 'bg-surface text-text-muted';
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const datePart = date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
        const timePart = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return { datePart, timePart };
    };

    return (
        <div className="mt-8 card h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h2 className="text-xs font-semibold text-text-primary">Recent Activity</h2>
                </div>
                <Button variant="primary" size="xs" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Transaction
                </Button>
            </div>

            <div className="px-6 py-3 border-b border-border space-y-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-surface border border-border rounded text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    <select
                        value={filterWallet}
                        onChange={(event) => setFilterWallet(event.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Wallets</option>
                        {wallets.map((wallet) => (
                            <option key={wallet.id} value={wallet.id}>
                                {wallet.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterType}
                        onChange={(event) => setFilterType(event.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdraw</option>
                        <option value="transfer_in">Transfer In</option>
                        <option value="transfer_out">Transfer Out</option>
                        <option value="adjust">Adjust</option>
                    </select>

                    <select
                        value={filterTime}
                        onChange={(event) => setFilterTime(event.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <div className="min-w-0 overflow-x-auto">
                <table className="w-full min-w-220">
                    <thead>
                        <tr className="border-b border-border bg-surface-elevated">
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Transaction
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Website
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {displayedRows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            displayedRows.map((row) => {
                                const { datePart, timePart } = formatDisplayDate(row.date);

                                return (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-surface-elevated/50 transition-colors"
                                    >
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-surface-elevated rounded">
                                                    {getTypeIcon(row.displayType)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-text-primary">
                                                        {row.walletName}
                                                    </p>
                                                    {row.description && (
                                                        <p className="text-[10px] text-text-muted truncate max-w-50">
                                                            {row.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-2">
                                            <span
                                                className={cn(
                                                    'text-xs font-semibold font-mono',
                                                    getTypeColor(row.displayType)
                                                )}
                                            >
                                                {row.amount >= 0 ? '+' : ''}
                                                {formatCurrency(row.amount)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-2">
                                            <span className="text-xs text-text-secondary capitalize">
                                                {row.displayType.replace('_', ' ')}
                                            </span>
                                        </td>

                                        <td className="px-6 py-2">
                                            <span className="text-xs text-text-secondary">
                                                {row.website || '-'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={cn(
                                                    'px-2 py-1 rounded text-[10px] font-medium capitalize',
                                                    getStatusClassName(row.status)
                                                )}
                                            >
                                                {row.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-2">
                                            <div>
                                                <p className="text-xs text-text-primary">{datePart}</p>
                                                <p className="text-[10px] text-text-muted">{timePart}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditTransactionClick(row.originalId)}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-surface-elevated rounded transition-colors"
                                                    title="Edit transaction"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTransaction(row.originalId)}
                                                    className="p-2 text-text-muted hover:text-danger hover:bg-surface-elevated rounded transition-colors"
                                                    title="Delete transaction"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-border px-6 py-3">
                <Link
                    to="/transactions"
                    className="flex items-center justify-between text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                    <span>View all transactions</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <AddTransactionModal
                open={isAddOpen}
                wallets={wallets}
                defaultType="deposit"
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleAddTransaction}
            />
            <EditTransactionModal
                open={editingTransaction !== null}
                transaction={editingTransaction ?? undefined}
                wallets={wallets}
                onClose={() => setEditingTransaction(null)}
                onSubmit={handleUpdateTransaction}
            />
        </div>
    );
}
