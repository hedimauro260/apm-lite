import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    History,
    Pencil,
    Plus,
    Search,
    Trash2,
    Wallet as WalletIcon,
    X,
} from "lucide-react";
import { cn, formatCurrency, formatDateTime } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import type { Site, SiteMovement, Wallet } from "../../types";

const PAGE_SIZE = 10;

export interface MovementsTableProps {
    sites: Site[];
    movements: SiteMovement[];
    wallets: Wallet[];
    onAdd: () => void;
    onEdit: (movement: SiteMovement) => void;
    onDelete: (movement: SiteMovement) => void;
}

export function MovementsTable({
    sites,
    movements,
    wallets,
    onAdd,
    onEdit,
    onDelete,
}: MovementsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | SiteMovement["type"]>("all");
    const [siteFilter, setSiteFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const siteNameById = useMemo(() => {
        const map = new Map<string, string>();
        sites.forEach((site) => map.set(site.id, site.name));
        return map;
    }, [sites]);

    const walletNameById = useMemo(() => {
        const map = new Map<string, string>();
        wallets.forEach((wallet) => map.set(wallet.id, wallet.name));
        return map;
    }, [wallets]);

    const filteredRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return movements
            .filter((m) => typeFilter === "all" || m.type === typeFilter)
            .filter((m) => siteFilter === "all" || m.siteId === siteFilter)
            .filter((m) => {
                if (!query) return true;
                const siteName = siteNameById.get(m.siteId) ?? "";
                return (
                    siteName.toLowerCase().includes(query) ||
                    m.description?.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => {
                const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (diff !== 0) return diff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [movements, typeFilter, siteFilter, searchQuery, siteNameById]);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, siteFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const displayedRows = filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const filterSelectClass =
        "h-9 px-3 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

    return (
        <section className="card flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-6 py-4 border-b border-border">
                <div>
                    <h2 className="text-xs font-semibold text-text-primary">
                        Movement History
                    </h2>
                    <p className="text-[10px] text-text-muted mt-0.5">
                        Earnings and withdrawals recorded across all platforms
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    className="lg:ml-auto"
                    onClick={onAdd}
                >
                    <Plus className="h-4 w-4" />
                    Earning / Withdrawal
                </Button>
            </div>

            {/* Filtros */}
            <div className="px-6 py-3 border-b border-border space-y-3">
                <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-44">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by site or description..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full h-9 pl-9 pr-8 bg-surface border border-border rounded text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary rounded"
                                title="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(event.target.value as "all" | SiteMovement["type"])
                        }
                        className={filterSelectClass}
                    >
                        <option value="all">All types</option>
                        <option value="earn">Earnings</option>
                        <option value="withdraw">Withdrawals</option>
                    </select>

                    <select
                        value={siteFilter}
                        onChange={(event) => setSiteFilter(event.target.value)}
                        className={filterSelectClass}
                    >
                        <option value="all">All sites</option>
                        {sites.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabela */}
            {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
                        <History className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            No movements
                        </p>
                        <p className="mt-1 text-xs text-text-muted max-w-sm">
                            {movements.length === 0
                                ? "Record earnings and withdrawals to track your income."
                                : "No movements match the applied filters."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto">
                    <table className="w-full min-w-195">
                        <thead>
                            <tr className="border-b border-border bg-surface-elevated">
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Site
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Wallet
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayedRows.map((movement) => {
                                const siteName = siteNameById.get(movement.siteId) ?? "Removed site";
                                const walletName = movement.walletId
                                    ? walletNameById.get(movement.walletId)
                                    : undefined;
                                const isEarn = movement.type === "earn";
                                const site = sites.find((s) => s.id === movement.siteId);

                                return (
                                    <tr
                                        key={movement.id}
                                        className="hover:bg-surface-elevated/50 transition-colors"
                                    >
                                        <td className="px-6 py-3">
                                            <p className="text-xs text-text-primary whitespace-nowrap">
                                                {formatDateTime(movement.date)}
                                            </p>
                                        </td>

                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className="p-1.5 rounded shrink-0"
                                                    style={{
                                                        backgroundColor: site?.color
                                                            ? `${site.color}18`
                                                            : undefined,
                                                        color: site?.color ?? "var(--color-text-muted)",
                                                    }}
                                                >
                                                    <ArrowDownToLine className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xs font-medium text-text-primary truncate">
                                                    {siteName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium",
                                                    isEarn
                                                        ? "bg-success/10 text-success"
                                                        : "bg-danger/10 text-danger"
                                                )}
                                            >
                                                {isEarn ? (
                                                    <ArrowDownToLine className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUpFromLine className="h-3 w-3" />
                                                )}
                                                {isEarn ? "Earning" : "Withdrawal"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            {movement.type === "withdraw" ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                                                    <WalletIcon className="h-3.5 w-3.5 text-text-muted" />
                                                    {walletName ?? "—"}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-text-muted">—</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-3">
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold font-mono",
                                                    isEarn ? "text-success" : "text-danger"
                                                )}
                                            >
                                                {isEarn ? "+" : "-"}
                                                {formatCurrency(movement.amount)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span className="text-xs font-medium text-text-primary font-mono">
                                                {formatCurrency(movement.balanceAfter)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(movement)}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-surface-elevated rounded transition-colors"
                                                    title="Edit movement"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(movement)}
                                                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                                                    title="Delete movement"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredRows.length > 0 && (
                <div className="border-t border-border px-6 py-3">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredRows.length}
                        pageSize={PAGE_SIZE}
                    />
                </div>
            )}
        </section>
    );
}
