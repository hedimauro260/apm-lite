import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn, formatCurrency } from '../../lib/utils';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { StatusBadge } from '../ui/StatusBadge';
import { useTransactions } from '../../hooks/useTransactions';
import type { Transaction, Wallet } from '../../types';
import {
    ArrowDownRight,
    ArrowUpRight,
    ArrowLeftRight,
    AlertCircle,
    Pencil,
    ChevronRight,
    Plus,
    Search,
} from 'lucide-react';

export interface GlobalActivityModuleProps {
    onAddTransaction?: () => void;
    onEditTransaction?: (transactionId: string) => void;
    usePagination?: boolean;
    pageSize?: number;
    transactions?: Transaction[];
    wallets?: Wallet[];
}

export function GlobalActivityModule({
    onAddTransaction,
    onEditTransaction,
    usePagination = false,
    pageSize = 20,
    transactions: injectedTransactions,
    wallets: injectedWallets,
}: GlobalActivityModuleProps) {
    const {
        transactions: fetchedTransactions,
        wallets: fetchedWallets,
        isLoading,
        expandTransactions
    } = useTransactions();

    // ⚡ Usa os dados injetados se disponíveis, senão usa os buscados
    const activeTransactions = injectedTransactions || fetchedTransactions;
    const activeWallets = injectedWallets || fetchedWallets;

    const [filterWallet, setFilterWallet] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterTime, setFilterTime] = useState('30');
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(pageSize);

    // Resetar página quando filtros mudam
    useMemo(() => {
        setCurrentPage(1);
    }, [filterWallet, filterType, filterTime, searchQuery]);

    // Filtrar transações
    const filteredRows = useMemo(() => {
        const now = new Date();
        const daysAgo = new Date(now.getTime() - parseInt(filterTime) * 24 * 60 * 60 * 1000);

        let rows = expandTransactions(activeTransactions);

        // Filtro por wallet
        if (filterWallet !== 'all') {
            rows = rows.filter(r => r.walletId === filterWallet);
        }

        // Filtro por tipo
        if (filterType !== 'all') {
            rows = rows.filter(r => r.displayType === filterType);
        }

        // Filtro por período
        rows = rows.filter(r => new Date(r.date) >= daysAgo);

        // Filtro por busca
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            rows = rows.filter(r =>
                r.walletName.toLowerCase().includes(q) ||
                r.coin.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q)
            );
        }

        return rows;
    }, [activeTransactions, filterWallet, filterType, filterTime, searchQuery, expandTransactions]);

    // ⚡ Aplicar paginação ou limite
    const displayedRows = useMemo(() => {
        if (usePagination) {
            const startIndex = (currentPage - 1) * currentPageSize;
            return filteredRows.slice(startIndex, startIndex + currentPageSize);
        } else {
            // Modo Dashboard: limita a 20
            return filteredRows.slice(0, 20);
        }
    }, [filteredRows, currentPage, currentPageSize, usePagination]);

    const totalPages = Math.ceil(filteredRows.length / currentPageSize);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit': return <ArrowDownRight className="h-4 w-4 text-success" />;
            case 'withdraw': return <ArrowUpRight className="h-4 w-4 text-danger" />;
            case 'transfer_in':
            case 'transfer_out': return <ArrowLeftRight className="h-4 w-4 text-primary" />;
            case 'add':
            case 'remove': return <AlertCircle className="h-4 w-4 text-warning" />;
            default: return null;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'transfer_in':
            case 'add': return 'text-success';
            case 'withdraw':
            case 'transfer_out':
            case 'remove': return 'text-danger';
            default: return 'text-text-primary';
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const datePart = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return { datePart, timePart };
    };

    if (isLoading) {
        return (
            <div className="card p-12 text-center text-text-muted">
                Loading transactions...
            </div>
        );
    }

    return (
        <Section
            title={usePagination ? "All Transactions" : "Recent Activity"}
            actions={
                <div className="flex items-center gap-3">
                    {!usePagination && filteredRows.length > 20 && (
                        <span className="text-xs text-text-muted hidden sm:inline">
                            Showing last 20
                        </span>
                    )}
                    <Button variant="primary" size="sm" onClick={onAddTransaction}>
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>
            }
            noPadding
        >
            {/* Filters */}
            <div className="px-6 py-4 border-b border-border space-y-4">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Wallet Filter */}
                    <select
                        value={filterWallet}
                        onChange={(e) => setFilterWallet(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Wallets</option>
                        {/* ⚡ CORREÇÃO: Usando activeWallets aqui */}
                        {activeWallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdraw</option>
                        <option value="transfer_in">Transfer In</option>
                        <option value="transfer_out">Transfer Out</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>

                    {/* Time Filter */}
                    <select
                        value={filterTime}
                        onChange={(e) => setFilterTime(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-surface-elevated">
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Transaction</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Coin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Website</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {displayedRows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            displayedRows.map((row) => {
                                const { datePart, timePart } = formatDisplayDate(row.date);
                                return (
                                    <tr key={row.id} className="hover:bg-surface-elevated/50 transition-colors">
                                        {/* Transaction */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-surface-elevated rounded-lg">
                                                    {getTypeIcon(row.displayType)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">{row.walletName}</p>
                                                    {row.description && (
                                                        <p className="text-xs text-text-muted truncate max-w-50">{row.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4">
                                            <span className={cn('text-sm font-semibold font-mono', getTypeColor(row.displayType))}>
                                                {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
                                            </span>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-text-secondary capitalize">
                                                {row.displayType.replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* Coin */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-text-primary">{row.coin}</span>
                                        </td>

                                        {/* Website */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-text-secondary">
                                                {row.website || '-'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-text-primary">{datePart}</p>
                                                <p className="text-xs text-text-muted">{timePart}</p>
                                            </div>
                                        </td>

                                        {/* Edit */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onEditTransaction?.(row.originalId)}
                                                className="p-2 text-text-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors"
                                                title="Edit transaction"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação (apenas se usePagination=true) */}
            {usePagination && filteredRows.length > 0 && (
                <div className="border-t border-border px-6 py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={currentPageSize}
                        onPageSizeChange={setCurrentPageSize}
                        totalItems={filteredRows.length}
                    />
                </div>
            )}

            {/* Footer (apenas se usePagination=false) */}
            {!usePagination && (
                <div className="border-t border-border px-6 py-3">
                    <Link
                        to="/transactions"
                        className="flex items-center justify-between text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                        <span>View all transactions</span>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </Section>
    );
}