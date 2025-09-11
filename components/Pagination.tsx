"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 4) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center mt-1">
      <div className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg bg-white">
  
        <button
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full shadow-md text-red-400",
            currentPage === 1 && "opacity-40 cursor-not-allowed"
          )}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt;
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="w-10 h-10 flex items-center justify-center text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all",
                page === currentPage
                  ? "bg-red-500 text-white"
                  : "bg-white text-red-500 hover:bg-red-100"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full shadow-md text-red-400",
            currentPage === totalPages && "opacity-40 cursor-not-allowed"
          )}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
