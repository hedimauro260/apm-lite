// src/components/ui/CalendarPopover.tsx
import { useState, useRef, useEffect } from 'react';
import { cn, formatDate } from '../../lib/utils';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame } from 'lucide-react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns';
import { useTransactionStreak } from '../../hooks/useTransactionStreak';

export interface CalendarPopoverProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    activeDates?: string[];
    onActiveDateClick?: (date: Date) => void;
    className?: string;
}

export function CalendarPopover({
    selectedDate,
    activeDates = [],
    onActiveDateClick,
    className
}: CalendarPopoverProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate);
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // ✅ Hook de streak
    const { streak, isLoading: streakLoading } = useTransactionStreak();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // ✅ Filtrar activeDates APENAS para o mês atual
    const activeDatesInMonth = activeDates.filter((d) => {
        const date = parseISO(d);
        return isSameMonth(date, currentMonth);
    });

    const isActive = (day: Date) => {
        return activeDatesInMonth.some((d) => isSameDay(parseISO(d), day));
    };

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsHovered(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isVisible = isOpen || isHovered;

    const handleDateClick = (day: Date) => {
        if (isActive(day)) {
            onActiveDateClick?.(day);
            setIsOpen(false);
            setIsHovered(false);
        }
    };

    const streakDisplay = streak > 0
        ? `${streak} day${streak > 1 ? 's' : ''}`
        : 'No active streak';

    return (
        <div
            ref={popoverRef}
            className={cn('relative', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2 text-text-secondary hover:text-text-primary"
            >
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, 'dd MMM yyyy')}
                {streak > 0 && (
                    <span className="ml-1 flex items-center gap-0.5 text-xs text-orange-500">
                        <Flame className="h-3 w-3" />
                        {streak}
                    </span>
                )}
            </Button>

            {isVisible && (
                <div className="absolute top-full left-0 mt-2 z-dropdown w-72 bg-surface border border-border rounded-lg shadow-dropdown p-4 animate-in fade-in">
                    {/* Header do Calendário */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentMonth(subMonths(currentMonth, 1));
                            }}
                            className="p-1 hover:bg-surface-elevated rounded"
                        >
                            <ChevronLeft className="h-4 w-4 text-text-secondary" />
                        </button>
                        <span className="text-sm font-semibold text-text-primary">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentMonth(addMonths(currentMonth, 1));
                            }}
                            className="p-1 hover:bg-surface-elevated rounded"
                        >
                            <ChevronRight className="h-4 w-4 text-text-secondary" />
                        </button>
                    </div>

                    {/* Dias da semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-text-muted">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Dias do mês */}
                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((day) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const hasActivity = isActive(day);

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDateClick(day);
                                    }}
                                    className={cn(
                                        'h-8 w-8 flex items-center justify-center rounded-full text-sm transition-colors relative',
                                        !isSameMonth(day, currentMonth) && 'text-text-muted opacity-50',
                                        isSelected && 'bg-primary text-white font-semibold',
                                        !isSelected && isSameMonth(day, currentMonth) && 'hover:bg-surface-elevated text-text-primary',
                                        hasActivity && !isSelected && 'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-success after:rounded-full',
                                        hasActivity && 'cursor-pointer',
                                        !hasActivity && 'cursor-default'
                                    )}
                                    title={hasActivity ? `${formatDate(day)} - Click to view transactions` : undefined}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    {/* ✅ Streak Info com dados do hook */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>
                                {streakLoading ? 'Loading...' : streakDisplay}
                            </span>
                        </div>
                        {/* ✅ Mostrar apenas dias ativos do mês atual */}
                        {activeDatesInMonth.length > 0 && (
                            <span className="text-xs text-text-muted">
                                {activeDatesInMonth.length} active days
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}