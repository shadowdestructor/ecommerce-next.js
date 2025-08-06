'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  className = '',
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className=\"flex flex-1 justify-between sm:hidden\">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className=\"relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed\"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className=\"relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed\"
        >
          Next
        </button>
      </div>
      
      <div className=\"hidden sm:flex sm:flex-1 sm:items-center sm:justify-between\">
        <div>
          <p className=\"text-sm text-gray-700\">
            Page <span className=\"font-medium\">{currentPage}</span> of{' '}
            <span className=\"font-medium\">{totalPages}</span>
          </p>
        </div>
        
        <div>
          <nav className=\"isolate inline-flex -space-x-px rounded-md shadow-sm\" aria-label=\"Pagination\">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
              className=\"relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              <span className=\"sr-only\">Previous</span>
              <ChevronLeftIcon className=\"h-5 w-5\" aria-hidden=\"true\" />
            </button>
            
            {visiblePages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : page === '...'
                    ? 'text-gray-700 ring-1 ring-inset ring-gray-300 cursor-default'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className=\"relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              <span className=\"sr-only\">Next</span>
              <ChevronRightIcon className=\"h-5 w-5\" aria-hidden=\"true\" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
}