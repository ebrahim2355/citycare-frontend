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

  return (
    <div className={cn("transition-opacity", fetching && !loading && "opacity-60")} aria-busy={loading || fetching}>
      {renderMobile && (
        <div className="grid gap-3 md:hidden">
          {loading
            ? Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)
            : rows?.map((row) => <div key={getRowKey(row)}>{renderMobile(row)}</div>)}
        </div>
      )}
      <div className={cn("overflow-hidden rounded-xl border bg-card", renderMobile && "hidden md:block")}>
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className={cn("h-11 px-4 text-xs font-semibold tracking-wide uppercase", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full max-w-36" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow key={getRowKey(row)}>
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
