import { useMemo } from "react";
import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { cn, formatCompactNumber, formatCurrency } from "../../lib/utils";
import {
    CalendarClock,
    CalendarDays,
    CalendarRange,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";
import {
    buildDailyGainsChart,
    type SiteSummary,
} from "./sitesLogic";
import type { SiteMovement } from "../../types";

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color?: string; stroke?: string }>;
    label?: string;
}) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="rounded-md border border-border bg-surface-elevated px-3 py-2 shadow-card">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {label}
            </p>
            {payload.map((entry) => (
                <p
                    key={entry.dataKey}
                    className="text-xs font-semibold"
                    style={{ color: entry.color || entry.stroke }}
                >
                    {entry.dataKey === "gains" ? "Earnings" : "Withdrawals"}:{" "}
                    {formatCurrency(Number(entry.value))}
                </p>
            ))}
        </div>
    );
}

interface SummaryRow {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
}

export interface EarningsChartSectionProps {
    movements: SiteMovement[];
    summary: SiteSummary;
}

export function EarningsChartSection({
    movements,
    summary,
}: EarningsChartSectionProps) {
    const chartData = useMemo(() => buildDailyGainsChart(movements, 30), [movements]);

    const summaryRows: SummaryRow[] = [
        {
            label: "Earning Today",
            value: summary.today,
            icon: TrendingUp,
            color: "bg-success/10 text-success",
        },
        {
            label: "Earning Yesterday",
            value: summary.yesterday,
            icon: CalendarClock,
            color: "bg-info/10 text-info",
        },
        {
            label: "Last 7 days",
            value: summary.last7d,
            icon: CalendarDays,
            color: "bg-primary/10 text-primary",
        },
        {
            label: "Last 30 days",
            value: summary.last30d,
            icon: CalendarRange,
            color: "bg-warning/10 text-warning",
        },
    ];

    return (
        <section className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Daily chart */}
                <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-border">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xs font-semibold text-text-primary">
                                Daily Earnings
                            </h2>
                            <p className="text-[10px] text-text-muted mt-0.5">
                                Last 30 days · sum across all sites
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-sm bg-primary" />
                                Earnings
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-sm bg-danger/70" />
                                Withdrawals
                            </span>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gainsGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#7C5CFC"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#7C5CFC"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--color-border)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--color-border)" }}
                                    interval={4}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: number) =>
                                        formatCompactNumber(value)
                                    }
                                    width={38}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-surface-elevated)", opacity: 0.4 }} />
                                <Area
                                    type="monotone"
                                    dataKey="gains"
                                    stroke="#7C5CFC"
                                    strokeWidth={2}
                                    fill="url(#gainsGradient)"
                                    activeDot={{ r: 4 }}
                                />
                                <Bar
                                    dataKey="withdrawn"
                                    fill="#EF4444"
                                    opacity={0.55}
                                    radius={[2, 2, 0, 0]}
                                    barSize={4}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary */}
                <div className="p-5">
                    <h2 className="text-xs font-semibold text-text-primary mb-4">
                        Period Summary
                    </h2>
                    <div className="flex flex-col gap-3">
                        {summaryRows.map((row) => {
                            const Icon = row.icon;
                            return (
                                <div
                                    key={row.label}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/40 px-4 py-3"
                                >
                                    <div className={cn("p-2 rounded shrink-0", row.color)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                            {row.label}
                                        </p>
                                        <p className="text-sm font-bold text-text-primary tracking-tight">
                                            {formatCurrency(row.value)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-4 text-[10px] text-text-muted leading-relaxed">
                        The current balance reflects each site's initial balance plus earnings
                        and minus withdrawals. It does not equal the total earned in the period.
                    </p>
                </div>
            </div>
        </section>
    );
}
