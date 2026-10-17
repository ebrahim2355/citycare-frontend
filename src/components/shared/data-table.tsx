import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string;
  loading?: boolean;
  fetching?: boolean;
  empty?: ReactNode;
  renderMobile?: (row: T) => ReactNode;
  skeletonRows?: number;
  caption?: string;
}

const SKELETON_WIDTHS = ["w-44", "w-20", "w-24", "w-16", "w-28", "w-20", "w-24"];

function FetchingLine({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="h-full w-1/3 animate-progress rounded-full bg-primary" />
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  fetching,
  empty,
  renderMobile,
  skeletonRows = 6,
  caption,
}: DataTableProps<T>) {
  if (!loading && rows && rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  const refreshing = Boolean(fetching && !loading);

  return (
    <div className="relative" aria-busy={loading || fetching}>
      {renderMobile && (
        <div className={cn("relative grid gap-3 transition-opacity duration-300 md:hidden", refreshing && "opacity-70")}>
          <FetchingLine active={refreshing} />
          {loading
            ? Array.from({ length: 3 }, (_, index) => <MobileSkeleton key={index} />)
            : rows?.map((row) => <div key={getRowKey(row)}>{renderMobile(row)}</div>)}
        </div>
      )}
      <div className={cn("relative overflow-hidden rounded-xl border bg-card shadow-card", renderMobile && "hidden md:block")}>
        <FetchingLine active={refreshing} />
        <Table className={cn("transition-opacity duration-300", refreshing && "opacity-70")}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("h-11 px-4 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase", column.className)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    {columns.map((column, columnIndex) => (
                      <TableCell key={column.key} className="px-4 py-4">
                        <Skeleton className={cn("h-4 max-w-full", SKELETON_WIDTHS[columnIndex % SKELETON_WIDTHS.length])} />
                        {columnIndex === 0 && <Skeleton className="mt-2 h-3 w-24" />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow key={getRowKey(row)} className="transition-colors hover:bg-muted/40">
                    {columns.map((column) => (
                      <TableCell key={column.key} className={cn("px-4 py-3", column.className)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
