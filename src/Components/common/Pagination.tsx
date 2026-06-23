/**
 * Reusable Pagination Component for Merchant Hub
 * 
 * Features:
 * - Smart ellipsis pagination (shows first, last, and a window around current page)
 * - Prev/Next navigation buttons
 * - Summary text showing total items and current page
 * - Consistent Snow UI design language
 */

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    /** Label for the summary text, e.g. "chuyến xe", "nhân viên" */
    itemLabel?: string;
    /** Number of sibling pages to show on each side of current page */
    siblingCount?: number;
}

function ChevronLeftIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

/**
 * Generate the page numbers to display with ellipsis logic.
 * Always shows first page, last page, and a window around current page.
 */
function generatePageNumbers(currentPage: number, totalPages: number, siblingCount: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
    if (totalPages <= 1) return [1];

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    // Calculate the range around the current page
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    // Whether we need ellipsis
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    // Always show page 1
    pages.push(1);

    // Left ellipsis or pages between 1 and the sibling window
    if (showLeftEllipsis) {
        pages.push('ellipsis-start');
    } else {
        // Fill in pages between 1 and leftSibling
        for (let i = 2; i < leftSibling; i++) {
            pages.push(i);
        }
    }

    // Sibling window (excluding first and last which are handled separately)
    for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== totalPages) {
            pages.push(i);
        }
    }

    // Right ellipsis or pages between sibling window and last page
    if (showRightEllipsis) {
        pages.push('ellipsis-end');
    } else {
        for (let i = rightSibling + 1; i < totalPages; i++) {
            pages.push(i);
        }
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    return pages;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemLabel = "mục",
    siblingCount = 1,
}: PaginationProps) {
    const safeTotalPages = Math.max(totalPages, 1);
    const pageNumbers = generatePageNumbers(currentPage, safeTotalPages, siblingCount);

    return (
        <div className="flex items-center justify-between pt-10 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tổng số {itemLabel}: <span className="text-slate-900">{totalItems}</span> · Trang{" "}
                <span className="text-slate-900">{currentPage}</span> /{" "}
                <span className="text-slate-900">{safeTotalPages}</span>
            </p>
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                >
                    <ChevronLeftIcon size={18} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                    {pageNumbers.map((item, index) => {
                        if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                            return (
                                <span
                                    key={item}
                                    className="w-12 h-12 flex items-center justify-center text-sm font-black text-slate-300 select-none"
                                >
                                    ···
                                </span>
                            );
                        }

                        return (
                            <button
                                key={item}
                                onClick={() => onPageChange(item)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                                    currentPage === item
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-white text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm"
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    disabled={currentPage >= safeTotalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                >
                    <ChevronRightIcon size={18} />
                </button>
            </div>
        </div>
    );
}
