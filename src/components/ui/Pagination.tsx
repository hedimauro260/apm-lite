import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    totalItems?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 20,
    onPageSizeChange,
    totalItems,
    className,
}: PaginationProps) {
    const canGoFirst = currentPage > 1;
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;
    const canGoLast = currentPage < totalPages;

    // Gerar números de página visíveis (máximo 5)
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems || 0);

    return (
        <div className={cn('flex items-center justify-between gap-4', className)}>
            {/* Informações de itens */}
            {totalItems !== undefined && (
                <div className="text-sm text-text-muted">
                    Showing <span className="font-medium text-text-primary">{startIndex}</span> to{' '}
                    <span className="font-medium text-text-primary">{endIndex}</span> of{' '}
                    <span className="font-medium text-text-primary">{totalItems}</span> entries
                </div>
            )}

            {/* Controles de paginação */}
            <div className="flex items-center gap-2">
                {/* Botão Primeira Página */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!canGoFirst}
                    className={cn(
                        'p-2 rounded-md border border-border transition-colors',
                        canGoFirst
                            ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                            : 'text-text-muted opacity-50 cursor-not-allowed'
                    )}
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Botão Página Anterior */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrev}
                    className={cn(
                        'p-2 rounded-md border border-border transition-colors',
                        canGoPrev
                            ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                            : 'text-text-muted opacity-50 cursor-not-allowed'
                    )}
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={cn(
                                'min-w-10 h-9 px-3 rounded-md border border-border text-sm font-medium transition-colors',
                                page === currentPage
                                    ? 'bg-primary text-white border-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
                                page === '...' && 'cursor-default'
                            )}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Botão Próxima Página */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className={cn(
                        'p-2 rounded-md border border-border transition-colors',
                        canGoNext
                            ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                            : 'text-text-muted opacity-50 cursor-not-allowed'
                    )}
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {/* Botão Última Página */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoLast}
                    className={cn(
                        'p-2 rounded-md border border-border transition-colors',
                        canGoLast
                            ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                            : 'text-text-muted opacity-50 cursor-not-allowed'
                    )}
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>

                {/* Seletor de itens por página */}
                {onPageSizeChange && (
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="h-9 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}