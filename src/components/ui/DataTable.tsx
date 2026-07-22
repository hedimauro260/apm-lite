import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    emptyDescription?: string;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    emptyMessage = 'No data found',
    emptyDescription = 'There are no records to display at the moment.',
    className,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={<Inbox className="h-10 w-10 text-text-muted" />}
                title={emptyMessage}
                description={emptyDescription}
            />
        );
    }

    return (
        <div className={cn('table-container', className)}>
            <table className="table">
                <thead className="table-header">
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} className={cn('px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider', col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="table-row">
                            {columns.map((col) => (
                                <td key={`${rowIndex}-${String(col.key)}`} className={cn('table-cell', col.className)}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}