import { ReactNode, useId } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { cn, formatCurrency } from "../../lib/utils";

export interface SummaryChartPoint {
    label: string;
    value: number;
}

export interface SummaryCardProps {
    title: string;
    value: number;
    secondaryText?: string;
    secondaryValue?: number;
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
    secondaryText,
    secondaryValue,
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
            <div className="flex items-start justify-between mb-1">
                <div>
                    <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">{title}</p>
                    <h3 className="mt-2 text-xl font-bold text-text-primary">{displayValue}</h3>
                </div>
                <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
                >
                    {icon}
                </div>
            </div>
            {secondaryValue !== undefined ? (
                <div className="mb-2 text-xs font-medium">
                    <span style={{ color: accentColor }}>{formatCurrency(secondaryValue)}</span>
                    {secondaryText && <span className="text-text-muted"> {secondaryText}</span>}
                </div>
            ) : secondaryText ? (
                <div className="mb-2 text-xs font-medium text-text-muted">
                    {secondaryText}
                </div>
            ) : null}
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