import { type ReactNode } from "react";
import { cn, formatCurrency } from "../../lib/utils";

export interface SummaryCardWalletsProps {
    title: string | ReactNode;
    value: number;
    secondaryText?: string;
    secondaryValue?: number;
    icon: ReactNode;
    color?: string;
    className?: string;
    isCurrency?: boolean;
}

export function SummaryCardWallets({
    title,
    value,
    secondaryText,
    secondaryValue,
    icon,
    color = "#7C5CFC",
    className,
    isCurrency = true,
}: SummaryCardWalletsProps) {
    const displayValue = isCurrency
        ? formatCurrency(value)
        : value.toLocaleString();

    return (
        <div
            className={cn("card p-4 flex flex-col justify-between h-full", className)}
        >
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            {title}
                        </p>
                        <h3 className="text-base font-bold text-text-primary tracking-tight">
                            {displayValue}
                        </h3>
                    </div>
                    <div
                        className="p-2 rounded"
                        style={{ backgroundColor: `${color}1A`, color }}
                    >
                        {icon}
                    </div>
                </div>

                {secondaryValue !== undefined ? (
                    <div className="flex items-center gap-1 text-xs font-medium mb-0">
                        <span style={{ color }}>{formatCurrency(secondaryValue)}</span>
                        {secondaryText && (
                            <span className="text-[10px] text-text-muted">
                                {secondaryText}
                            </span>
                        )}
                    </div>
                ) : secondaryText ? (
                    <div className="text-xs font-medium text-text-muted mb-0">
                        {secondaryText}
                    </div>
                ) : null}
            </div>
        </div>
    );
}