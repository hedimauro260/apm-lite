import { type ReactNode } from "react";
import { cn, formatCurrency } from "../../lib/utils";
import {
    ArrowDownRight,
    ArrowUpRight,
    Globe,
    Minus,
    TrendingUp,
    Wallet as WalletIcon,
} from "lucide-react";
import type { SiteSummary } from "./sitesLogic";

export interface WebsitesSummaryCardProps {
    title: string;
    value: number;
    subtitle?: string;
    icon: ReactNode;
    trend?: "up" | "down" | "neutral";
    compareLabel?: string;
    isCurrency?: boolean;
}

function SummaryCardItem({
    title,
    value,
    subtitle,
    icon,
    trend = "neutral",
    compareLabel,
    isCurrency = true,
}: WebsitesSummaryCardProps) {
    const TrendIcon =
        trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
    const trendColor =
        trend === "up"
            ? "text-success"
            : trend === "down"
                ? "text-danger"
                : "text-text-muted";

    return (
        <div className="card p-4 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                            {title}
                        </p>
                        <h3 className="text-base font-bold text-text-primary tracking-tight truncate">
                            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
                        </h3>
                    </div>
                    <div
                        className={cn(
                            "p-2 rounded shrink-0",
                            trend === "up"
                                ? "bg-success/10 text-success"
                                : trend === "down"
                                    ? "bg-danger/10 text-danger"
                                    : "bg-surface-elevated text-text-secondary",
                        )}
                    >
                        {icon}
                    </div>
                </div>

                {(subtitle || compareLabel) && (
                    <div className="flex items-center gap-1 text-xs font-medium">
                        {compareLabel && (
                            <>
                                <TrendIcon className="h-3.5 w-3.5" />
                                <span className={trendColor}>{compareLabel}</span>
                            </>
                        )}
                        {subtitle && (
                            <span className="text-[10px] text-text-muted truncate">
                                {subtitle}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export interface WebsitesSummaryCardsProps {
    summary: SiteSummary;
    siteCount: number;
}

export function WebsitesSummaryCards({
    summary,
    siteCount,
}: WebsitesSummaryCardsProps) {
    const todayVsYesterday =
        summary.yesterday > 0
            ? Math.round(
                ((summary.today - summary.yesterday) / summary.yesterday) * 100,
            )
            : 0;
    const todayTrend: "up" | "down" | "neutral" =
        todayVsYesterday > 0 ? "up" : todayVsYesterday < 0 ? "down" : "neutral";

    return (
        <section className="pb-4 border-b border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCardItem
                    title="Total Balance"
                    value={summary.totalBalance}
                    icon={<WalletIcon className="h-5 w-5" />}
                    trend="neutral"
                    subtitle={`across ${siteCount} ${siteCount === 1 ? "site" : "sites"}`}
                />
                <SummaryCardItem
                    title="Earnings Today"
                    value={summary.earningsToday}
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend={todayTrend}
                    compareLabel={`${todayVsYesterday > 0 ? "+" : ""}${todayVsYesterday}%`}
                    subtitle="vs yesterday"
                />
                <SummaryCardItem
                    title="Withdrawn"
                    value={summary.withdrawalsTotal}
                    icon={<ArrowUpRight className="h-5 w-5" />}
                    trend="neutral"
                    subtitle="total accumulated withdrawals"
                />
                <SummaryCardItem
                    title="Active Sites"
                    value={summary.activeSites}
                    isCurrency={false}
                    icon={<Globe className="h-5 w-5" />}
                    trend="neutral"
                    subtitle={`of ${siteCount} ${siteCount === 1 ? "registered site" : "registered sites"}`}
                />
            </div>
        </section>
    );
}
