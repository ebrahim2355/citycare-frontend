import type { ReactNode } from "react";
import { StatCardSkeleton } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const onNavy = "bg-white/10 before:via-white/10 dark:before:via-white/10";
const BAR_HEIGHTS = [38, 62, 45, 80, 55, 70, 42, 88, 60, 74, 50, 66];

function Loading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("animate-fade-in space-y-6 [animation-delay:80ms]", className)}>
      <span className="sr-only">Loading</span>
      {children}
    </div>
  );
}

export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {action && <Skeleton className="h-10 w-40 rounded-lg" />}
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="rounded-2xl bg-navy px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className={cn("h-3 w-36", onNavy)} />
          <Skeleton className={cn("h-9 w-60 max-w-full", onNavy)} />
          <Skeleton className={cn("h-4 w-80 max-w-full", onNavy)} />
        </div>
        <Skeleton className={cn("h-10 w-36 rounded-lg", onNavy)} />
      </div>
    </div>
  );
}

function StatGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

function CardHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-3.5 w-64 max-w-full" />
    </div>
  );
}

function ChartCardSkeleton({ kind = "bars" }: { kind?: "bars" | "donut" }) {
  return (
    <Card className="gap-6 p-5 sm:p-6">
      <CardHeaderSkeleton />
      {kind === "donut" ? (
        <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
          <Skeleton className="mx-auto size-44 rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-3.5 w-full max-w-48" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-56 items-end gap-2 border-b pb-px">
          {BAR_HEIGHTS.map((height, index) => (
            <Skeleton key={index} className="flex-1 rounded-b-none" style={{ height: `${height}%` }} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ItemSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

function ListCardSkeleton({ items = 3 }: { items?: number }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <CardHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: items }, (_, index) => (
          <ItemSkeleton key={index} />
        ))}
      </div>
    </Card>
  );
}

export function OverviewSkeleton({ variant }: { variant: "citizen" | "staff" | "admin" }) {
  return (
    <Loading className="space-y-8">
      <BannerSkeleton />
      <StatGridSkeleton count={variant === "admin" ? 8 : 4} />
      {variant === "admin" && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <ChartCardSkeleton />
          <ChartCardSkeleton kind="donut" />
        </div>
      )}
      {variant === "citizen" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ListCardSkeleton />
          <ChartCardSkeleton kind="donut" />
        </div>
      )}
      {variant === "staff" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ListCardSkeleton items={2} />
          <ListCardSkeleton items={2} />
        </div>
      )}
    </Loading>
  );
}

function FilterBarSkeleton({ filters }: { filters: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full sm:w-72" />
      {filters > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {Array.from({ length: filters }, (_, index) => (
            <Skeleton key={index} className="h-10 sm:w-44" />
          ))}
        </div>
      )}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <ItemSkeleton key={index} />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-card md:block">
        <div className="flex h-11 items-center gap-6 border-b bg-muted/60 px-4">
          {["w-24", "w-14", "w-16", "w-14", "w-20", "w-16"].map((width, index) => (
            <Skeleton key={index} className={cn("h-3", width, index === 0 && "mr-auto")} />
          ))}
        </div>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-6 border-b px-4 py-3.5 last:border-0">
            <div className="mr-auto space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <div className="hidden gap-1 sm:flex">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="size-9 rounded-lg" />
          ))}
        </div>
      </div>
    </>
  );
}

export function ListPageSkeleton({ filters = 3, stats = 0, rows = 7, action = false }: { filters?: number; stats?: number; rows?: number; action?: boolean }) {
  return (
    <Loading>
      <HeaderSkeleton action={action} />
      {stats > 0 && <StatGridSkeleton count={stats} />}
      <FilterBarSkeleton filters={filters} />
      <TableSkeleton rows={rows} />
    </Loading>
  );
}

export function CardsPageSkeleton({ stats = 4, cards = 6 }: { stats?: number; cards?: number }) {
  return (
    <Loading>
      <HeaderSkeleton />
      {stats > 0 && <StatGridSkeleton count={stats} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <Card key={index} className="gap-4 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </Card>
        ))}
      </div>
    </Loading>
  );
}

export function ChartsPageSkeleton() {
  return (
    <Loading className="space-y-8">
      <HeaderSkeleton />
      <StatGridSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ChartCardSkeleton />
        <ChartCardSkeleton kind="donut" />
      </div>
      <ListCardSkeleton items={2} />
    </Loading>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <Loading>
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="gap-6 p-5 sm:p-6">
          <CardHeaderSkeleton />
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <FieldSkeleton key={index} />
            ))}
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </Card>
        <Card className="gap-5 p-5 sm:p-6">
          <CardHeaderSkeleton />
          {Array.from({ length: 3 }, (_, index) => (
            <FieldSkeleton key={index} />
          ))}
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>
      </div>
    </Loading>
  );
}

export function DetailPageSkeleton() {
  return (
    <Loading>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-9 w-md max-w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="gap-6 p-5 sm:p-6">
            <CardHeaderSkeleton />
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className={cn("flex items-center", index > 0 && "flex-1")}>
                  {index > 0 && <Skeleton className="mx-2 h-0.5 flex-1" />}
                  <Skeleton className="size-8 rounded-full" />
                </div>
              ))}
            </div>
            <div className="space-y-5 border-l pl-6">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="gap-5 p-5 sm:p-6">
            <CardHeaderSkeleton />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-14 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-20 rounded-lg" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="gap-4 p-5">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </Card>
          <Card className="gap-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </Card>
        </div>
      </div>
    </Loading>
  );
}

export function WizardSkeleton() {
  return (
    <Loading className="mx-auto max-w-3xl">
      <HeaderSkeleton />
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={cn("flex items-center", index > 0 && "flex-1")}>
            {index > 0 && <Skeleton className="mx-2 h-0.5 flex-1" />}
            <Skeleton className="size-9 rounded-full" />
          </div>
        ))}
      </div>
      <Card className="gap-6 p-5 sm:p-7">
        <CardHeaderSkeleton />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border p-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-5">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </Card>
    </Loading>
  );
}

export function PublicPageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div role="status" className="animate-fade-in [animation-delay:80ms]">
      <span className="sr-only">Loading</span>
      <div className="bg-navy">
        <div className="container-page space-y-5 py-12 sm:py-16 lg:py-20">
          <Skeleton className={cn("h-3 w-28", onNavy)} />
          <Skeleton className={cn("h-11 w-136 max-w-full", onNavy)} />
          <Skeleton className={cn("h-5 w-160 max-w-full", onNavy)} />
          <Skeleton className={cn("h-11 w-40 rounded-lg", onNavy)} />
        </div>
      </div>
      <div className="container-page grid gap-6 py-12 sm:py-16 lg:grid-cols-2">
        {Array.from({ length: cards }, (_, index) => (
          <Card key={index} className="gap-5 p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-64 max-w-full" />
              </div>
            </div>
            {Array.from({ length: 3 }, (_, row) => (
              <div key={row} className="flex items-center justify-between gap-4 border-t pt-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
