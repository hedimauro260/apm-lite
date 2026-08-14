import { ReactNode, useId } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { cn, formatCurrency } from "../../lib/utils";
import { ArrowUpRight } from "lucide-react";

export interface SummaryChartPoint {
    label: string;
    value: number;
}

export interface SummaryCardProps {
    title: string;
    value: number;
    variation?: number;
    icon: ReactNode;
    trend?: "up" | "down" | "neutral";
    className?: string;
    isCurrency?: boolean;
    data?: SummaryChartPoint[];
    color?: string;
}

const TREND_COLORS: Record<NonNullable<SummaryCardProps["trend"]>, string> = {
    up: "#22C55E",
    down: "#EF4444",
    neutral: "#7C5CFC",
};

export function SummaryCard({
    title,
    value,
    variation,
    icon,
    trend = "neutral",
    className,
    isCurrency = true,
    data,
    color,
}: SummaryCardProps) {
    const gradientId = useId();
    const accentColor = color ?? TREND_COLORS[trend];
    const displayValue = isCurrency
        ? formatCurrency(value)
        : value.toLocaleString();

    return (
        <div className={cn("card h-full p-4 flex flex-col justify-between",
            className
        )}>
            <div className="flex items-start justify-between mb-0">
                <div>
                    <p className="text-xs font-medium text-text-muted">{title}</p>
                    <h3 className="mt-2 text-xl font-bold text-text-primary">{displayValue}</h3>
                </div>
                <div className={cn("p-2 rounded-md",
                    trend === "up"
                        ? "bg-success/10 text-success"
                        : trend === "down"
                            ? "bg-danger/10 text-danger"
                            : "bg-surface-elevated text-text-secondary",
                )}>
                    {icon}
                </div>
            </div>
            <div className="mb-2 flex items-end gap-1 text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                <span className="text-success">{variation}%</span>
                <span className="text-[10px] text-text-muted">vs yesterday</span>
            </div>
            {/* Area Chart */}
            <div className="h-16 mt-auto pt-2 border-t border-border/50">
                {data && data.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <XAxis hide />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={accentColor}
                                strokeWidth={1.5}
                                fill={`url(#${gradientId})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}