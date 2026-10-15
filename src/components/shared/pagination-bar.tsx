"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Meta } from "@/types";

interface PaginationBarProps {
  meta: Meta;
  onPageChange: (page: number) => void;
  label?: string;
}

const pageWindow = (page: number, totalPages: number) => {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function PaginationBar({ meta, onPageChange, label = "results" }: PaginationBarProps) {
  if (meta.total === 0) {
    return null;
  }

  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(first)}</span> to{" "}
        <span className="font-medium text-foreground">{formatNumber(last)}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(meta.total)}</span> {label}
      </p>
      {meta.totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            <ChevronLeft />
          </Button>
          {pageWindow(meta.page, meta.totalPages).map((page) => (
            <Button
              key={page}
              variant={page === meta.page ? "default" : "ghost"}
              size="icon"
              aria-label={`Page ${page}`}
              aria-current={page === meta.page ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </nav>
  );
}
