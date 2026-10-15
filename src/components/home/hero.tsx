import { ArrowRight, CircleCheck, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatHours, formatNumber } from "@/lib/format";
import type { PublicStats } from "@/types";

function LiveBoard({ stats }: { stats: PublicStats | null }) {
  if (!stats) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-xl shadow-primary/5">
        Live numbers from the city are not available right now. You can still report a problem or track a complaint.
      </div>
    );
  }

  const figures = [
    { label: "Reports so far", value: formatNumber(stats.totalComplaints) },
    { label: "Resolved", value: `${stats.resolutionRate}%` },
    { label: "Average fix time", value: formatHours(stats.averageResolutionHours) },
  ];

  return (
    <div className="relative rounded-2xl border bg-card p-5 shadow-2xl shadow-primary/10 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          Live city board
        </p>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {formatNumber(stats.openComplaints)} open now
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {figures.map((figure) => (
          <div key={figure.label} className="rounded-xl bg-muted/60 p-3">
            <dt className="text-[11px] font-medium text-muted-foreground sm:text-xs">{figure.label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{figure.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 space-y-2.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Recently fixed</p>
        {stats.recentlyResolved.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border bg-background/60 p-3">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden />
                  {item.area}
                </span>
                <span>{item.category}</span>
                {item.resolutionHours !== null && <span>fixed in {formatHours(item.resolutionHours)}</span>}
              </p>
            </div>
          </div>
        ))}
        {stats.recentlyResolved.length === 0 && (
          <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">The first fixes will show up here.</p>
        )}
      </div>
    </div>
  );
}

export function Hero({ stats }: { stats: PublicStats | null }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_10%_-10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent),radial-gradient(40rem_25rem_at_100%_0%,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"
      />
      <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Every report gets a tracking code and a deadline
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Report it. Track it. <span className="text-primary">See it fixed.</span>
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            CityCare connects the people of Dhaka with the departments that fix roads, street lights, water lines and waste
            collection. You always know who is working on your report and when it is due.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-5 text-base">
              <Link href="/dashboard/complaints/new">
                Report a problem
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5 text-base">
              <Link href="/track">
                <Search data-icon="inline-start" />
                Track a complaint
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free for problems on public property. Some home services have a small fee, paid safely with Stripe.
          </p>
        </div>
        <LiveBoard stats={stats} />
      </div>
    </section>
  );
}
