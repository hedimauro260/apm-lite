import { type ChangeEvent } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './Input';
import { Search } from 'lucide-react';

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterBarProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: {
        id: string;
        label: string;
        options: FilterOption[];
        value: string;
        onChange: (value: string) => void;
    }[];
    className?: string;
}

export function FilterBar({
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    filters = [],
    className,
}: FilterBarProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4', className)}>
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {filters.map((filter) => (
                        <select
                            key={filter.id}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="h-10 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
            )}
        </div>
    );
}