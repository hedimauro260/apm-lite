import { useState, useMemo } from 'react';
import { type AssetMovement } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { PRESET_ASSETS } from '../../data/asset-list';
import { Pagination } from '../ui/Pagination';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface AssetActivityTableProps {
    movements: AssetMovement[];
}

export function AssetActivityTable({ movements }: AssetActivityTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAsset, setFilterAsset] = useState('all');
    const [filterWallet, setFilterWallet] = useState('all');
    const [filterAction, setFilterAction] = useState('all');

    // Resetar página ao mudar filtros
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterAsset, filterWallet, filterAction]);

    // Filtragem
    const filteredMovements = useMemo(() => {
        return movements.filter(m => {
            const matchesSearch =
                m.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.assetSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.walletName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesAsset = filterAsset === 'all' || m.assetSymbol === filterAsset;
            const matchesWallet = filterWallet === 'all' || m.walletName === filterWallet;
            const matchesAction = filterAction === 'all' || m.actionType === filterAction;

            return matchesSearch && matchesAsset && matchesWallet && matchesAction;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenar por data (mais recente primeiro)
    }, [movements, searchQuery, filterAsset, filterWallet, filterAction]);

    // Paginação
    const paginatedMovements = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMovements.slice(start, start + pageSize);
    }, [filteredMovements, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredMovements.length / pageSize);

    // Helpers visuais
    const getAssetLogo = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.logo || null;
    };

    const getAssetColor = (symbol: string) => {
        const preset = PRESET_ASSETS.find(p => p.symbol === symbol);
        return preset?.defaultColor || '#627EEA';
    };

    const uniqueAssets = useMemo(() => Array.from(new Set(movements.map(m => m.assetSymbol))), [movements]);
    const uniqueWallets = useMemo(() => Array.from(new Set(movements.map(m => m.walletName))), [movements]);

    return (
        <div className="card">
            {/* Header e Filtros */}
            <div className="px-6 py-4 border-b border-border space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Assets Activity</h3>
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search asset or wallet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Filtro Asset */}
                    <select
                        value={filterAsset}
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Assets</option>
                        {uniqueAssets.map(symbol => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                    </select>

                    {/* Filtro Wallet */}
                    <select
                        value={filterWallet}
                        onChange={(e) => setFilterWallet(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Wallets</option>
                        {uniqueWallets.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>

                    {/* Filtro Ação */}
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All Actions</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-surface-elevated">
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Value USD</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Wallet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                    No activity found
                                </td>
                            </tr>
                        ) : (
                            paginatedMovements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-surface-elevated/50 transition-colors">
                                    {/* Asset Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-elevated border border-border">
                                                {getAssetLogo(movement.assetSymbol) ? (
                                                    <img
                                                        src={getAssetLogo(movement.assetSymbol)!}
                                                        alt={movement.assetName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                                                        style={{ backgroundColor: getAssetColor(movement.assetSymbol) }}
                                                    >
                                                        {movement.assetSymbol.slice(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{movement.assetName}</p>
                                                <p className="text-xs text-text-muted">{movement.assetSymbol}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-text-primary">
                                            {movement.quantity.toFixed(8)}
                                        </span>
                                    </td>

                                    {/* Value USD */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-text-primary">
                                            {formatCurrency(movement.currentValue)}
                                        </span>
                                    </td>

                                    {/* Wallet */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-text-secondary">{movement.walletName}</span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-text-secondary">
                                            {formatDate(movement.date)}
                                        </span>
                                    </td>

                                    {/* Action Badge */}
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                            movement.actionType === 'add'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-danger/10 text-danger'
                                        )}>
                                            {movement.actionType === 'add'
                                                ? <ArrowUpRight className="h-3.5 w-3.5" />
                                                : <ArrowDownRight className="h-3.5 w-3.5" />
                                            }
                                            {movement.actionType === 'add' ? 'Add' : 'Remove'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {filteredMovements.length > 0 && (
                <div className="border-t border-border px-6 py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        totalItems={filteredMovements.length}
                    />
                </div>
            )}
        </div>
    );
}