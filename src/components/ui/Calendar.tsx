import { useMemo, type ReactNode } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DATE_KEY = "yyyy-MM-dd";

export interface CalendarProps {
  month: Date;
  onMonthChange?: (month: Date) => void;
  depositDates?: Set<string>;
  footer?: ReactNode;
  className?: string;
}

export function Calendar({
  month,
  onMonthChange,
  depositDates,
  footer,
  className,
}: CalendarProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const handlePrevMonth = () => {
    onMonthChange?.(addMonths(month, -1));
  };

  const handleNextMonth = () => {
    onMonthChange?.(addMonths(month, 1));
  };

  return (
    <div
      className={cn(
        "w-64 p-3 bg-surface border border-border rounded-lg shadow-dropdown",
        className
      )}
    >
      <div className="flex items-center justify-between px-1 mb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-text-primary capitalize">
          {format(month, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-medium text-text-muted py-1"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayKey = format(day, DATE_KEY);
          const hasDeposit = depositDates?.has(dayKey) ?? false;
          const inMonth = isSameMonth(day, month);

          return (
            <div
              key={dayKey}
              className="flex flex-col items-center justify-center py-0.5"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition-colors",
                  isToday(day)
                    ? "bg-primary text-text-primary font-semibold"
                    : inMonth
                      ? "text-text-primary hover:bg-surface-elevated"
                      : "text-text-muted/40"
                )}
              >
                {format(day, "d")}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  hasDeposit
                    ? "bg-success"
                    : "bg-transparent"
                )}
              />
            </div>
          );
        })}
      </div>

      {footer && (
        <div className="mt-2 pt-2 border-t border-border">{footer}</div>
      )}
    </div>
  );
}