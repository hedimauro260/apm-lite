import { useMemo, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ExternalLink,
    Globe,
    Plus,
    Search,
    X,
} from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";
import type { Site, SiteMovement } from "../../types";
import { computeSiteRowStats } from "./sitesLogic";
import { SiteContextMenu } from "./SiteContextMenu";

export interface WebsitesTableProps {
    sites: Site[];
    movements: SiteMovement[];
    onAddMovement: (siteId: string) => void;
    onEdit: (site: Site) => void;
    onDelete: (site: Site) => void;
    onToggleStatus: (site: Site) => void;
}

export function WebsitesTable({
    sites,
    movements,
    onAddMovement,
    onEdit,
    onDelete,
    onToggleStatus,
}: WebsitesTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | Site["status"]>("all");

    const filteredSites = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return sites
            .filter((site) => statusFilter === "all" || site.status === statusFilter)
            .filter((site) => {
                if (!query) return true;
                return (
                    site.name.toLowerCase().includes(query) ||
                    site.description?.toLowerCase().includes(query) ||
                    site.url?.toLowerCase().includes(query)
                );
            });
    }, [sites, searchQuery, statusFilter]);

    return (
        <section className="card flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-6 py-4 border-b border-border">
                <div>
                    <h2 className="text-xs font-semibold text-text-primary">
                        Platforms
                    </h2>
                    <p className="text-[10px] text-text-muted mt-0.5">
                        Current balance and earnings per site
                    </p>
                </div>

                <div className="lg:ml-auto flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search site..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full lg:w-48 h-9 pl-9 pr-8 bg-surface border border-border rounded text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value as "all" | Site["status"])
                        }
                        className="h-9 px-3 bg-surface border border-border rounded text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Tabela */}
            {filteredSites.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
                        <Globe className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            No sites found
                        </p>
                        <p className="mt-1 text-xs text-text-muted max-w-sm">
                            {sites.length === 0
                                ? "Add your first task platform to start tracking your earnings."
                                : "No sites match the applied filters."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto">
                    <table className="w-full min-w-180">
                        <thead>
                            <tr className="border-b border-border bg-surface-elevated">
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Site
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Current Balance
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Today
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Yesterday
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Withdrawn
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSites.map((site) => {
                                const stats = computeSiteRowStats(movements, site.id);
                                const siteColor = site.color || "#7C5CFC";
                                return (
                                    <tr
                                        key={site.id}
                                        className={cn(
                                            "transition-colors hover:bg-surface-elevated/50",
                                            site.status === "inactive" && "opacity-60"
                                        )}
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="p-2 rounded-md shrink-0"
                                                    style={{
                                                        backgroundColor: `${siteColor}18`,
                                                        color: siteColor,
                                                    }}
                                                >
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-text-primary truncate">
                                                        {site.name}
                                                    </p>
                                                    {site.url && (
                                                        <a
                                                            href={site.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors"
                                                        >
                                                            <span className="truncate max-w-44">
                                                                {site.url.replace(/^https?:\/\//, "")}
                                                            </span>
                                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span className="text-xs font-bold text-text-primary font-mono">
                                                {formatCurrency(site.balance)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                                                <ArrowDownToLine className="h-3.5 w-3.5" />
                                                {stats.today > 0
                                                    ? formatCurrency(stats.today)
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span className="text-xs font-medium text-text-secondary font-mono">
                                                {stats.yesterday > 0
                                                    ? formatCurrency(stats.yesterday)
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger">
                                                <ArrowUpFromLine className="h-3.5 w-3.5" />
                                                {stats.withdrawn > 0
                                                    ? formatCurrency(stats.withdrawn)
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-1 rounded text-[10px] font-medium",
                                                    site.status === "active"
                                                        ? "bg-success/10 text-success"
                                                        : "bg-surface-elevated text-text-muted"
                                                )}
                                            >
                                                {site.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onAddMovement(site.id)}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-surface-elevated rounded transition-colors"
                                                    title="Add earning/withdrawal"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <SiteContextMenu
                                                    site={site}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                    onToggleStatus={onToggleStatus}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredSites.length > 0 && (
                <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-surface-elevated/30">
                    <p className="text-[10px] text-text-muted">
                        Showing {filteredSites.length} of {sites.length} sites
                    </p>
                </div>
            )}
        </section>
    );
}
