// src/components/layout/Header/HeaderDate.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Calendar, Flame } from "lucide-react";
import { format, isSameMonth, parseISO } from "date-fns";
import { Calendar as CalendarGrid } from "../../ui/Calendar";
import { cn } from "../../../lib/utils";
import { db } from "../../../database/db";

const DATE_KEY = "yyyy-MM-dd";

function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function queryOrNull<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((error) => {
    console.error("Error loading transactions", error);
    return null;
  });
}

export function HeaderDate() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const depositsResult = useLiveQuery(
    () => queryOrNull(db.transactions.where("type").equals("deposit").toArray()),
    []
  );

  const deposits = Array.isArray(depositsResult) ? depositsResult : [];

  const depositDates = useMemo(() => {
    return new Set(deposits.map((t) => format(parseISO(t.date), DATE_KEY)));
  }, [deposits]);

  const activeDays = useMemo(() => {
    let count = 0;
    for (const key of depositDates) {
      if (isSameMonth(parseISO(key), visibleMonth)) {
        count += 1;
      }
    }
    return count;
  }, [depositDates, visibleMonth]);

  const isOpen = isPinned || isHovered;

  useEffect(() => {
    if (!isPinned) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsPinned(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPinned(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPinned]);

  const handleClick = () => {
    setIsPinned((prev) => !prev);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors",
          "hover:bg-surface-elevated",
          isOpen && "bg-surface-elevated"
        )}
        aria-label="Calendar"
        aria-expanded={isOpen}
      >
        <Calendar className="h-4 w-4 text-text-muted" />
        <span className="text-xs text-text-secondary">
          {formatHeaderDate(new Date())}
        </span>
      </button>

      {isOpen && (
        <div className="absolute -right-15 top-full mt-2 z-50">
          <CalendarGrid
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            depositDates={depositDates}
            footer={
              <div className="flex items-center gap-1.5 text-xs font-medium text-warning">
                <Flame className="h-3.5 w-3.5" />
                <span>
                  {activeDays} active {activeDays === 1 ? "day" : "days"}
                </span>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}