import { ArrowRight, CircleCheck, Clock3, CreditCard, MapPin, Search, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatHours, formatNumber } from "@/lib/format";
import type { PublicStats } from "@/types";

function LiveDot() {
  return (
    <span className="relative flex size-2.5" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-mint" />
    </span>
  );
}

function StreetMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 520" fill="none" aria-hidden className={className}>
      <path d="M-20 400C110 350 210 440 340 385S540 300 660 335" stroke="currentColor" strokeWidth="22" strokeLinecap="round" opacity="0.55" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M40 -10 L150 530" />
        <path d="M250 -10 L210 530" />
        <path d="M430 -10 L470 530" />
        <path d="M600 -10 L560 530" />
        <path d="M-10 90 L660 140" />
        <path d="M-10 230 L660 205" />
        <path d="M-10 480 L660 455" />
        <path d="M120 -10 L660 420" strokeWidth="5" />
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.7">
        <path d="M330 -10 L330 530" />
        <path d="M-10 160 L660 175" />
        <path d="M520 -10 L640 260" />
        <path d="M-10 300 L300 290" />
      </g>
      <g className="text-mint">
        <circle cx="214" cy="226" r="5" fill="currentColor" />
        <circle cx="437" cy="196" r="5" fill="currentColor" />
        <circle cx="333" cy="160" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="560" cy="437" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="437" cy="196" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="214" cy="226" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </g>
    </svg>
  );
}

function LiveBoard({ stats }: { stats: PublicStats | null }) {
  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-6 text-sm text-muted-foreground shadow-float">
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
    <div className="relative min-w-0 animate-fade-up [animation-delay:120ms]">
      <div aria-hidden className="absolute -inset-4 rounded-[1.75rem] bg-mint/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card text-card-foreground shadow-float">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <p className="flex items-center gap-2.5 text-sm font-semibold">
            <LiveDot />
            Live city board
          </p>
          <span className="rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {formatNumber(stats.openComplaints)} open now
          </span>
        </div>
        <dl className="grid grid-cols-3 divide-x border-b">
          {figures.map((figure) => (
            <div key={figure.label} className="px-4 py-4 sm:px-5">
              <dt className="text-[11px] font-medium text-muted-foreground sm:text-xs">{figure.label}</dt>
              <dd className="mt-1 font-display text-xl font-semibold tabular-nums sm:text-2xl">{figure.value}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-2.5 p-5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Recently fixed</p>
          <ul className="stagger space-y-2">
            {stats.recentlyResolved.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden />
                      {item.area}
                    </span>
                    <span>{item.category}</span>
                    {item.resolutionHours !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3" aria-hidden />
                        fixed in {formatHours(item.resolutionHours)}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
            {stats.recentlyResolved.length === 0 && (
              <li className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">The first fixes will show up here.</li>
            )}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-5 py-3 text-sm">
          <span className="text-muted-foreground">Have a tracking code?</span>
          <Link href="/track" className="group inline-flex items-center gap-1 font-medium text-primary">
            Track your report
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

const trust = [
  { icon: ShieldCheck, text: "Free for public property" },
  { icon: CreditCard, text: "Fees paid by card, bKash or Nagad" },
  { icon: Ticket, text: "A tracking code in seconds" },
];

export function Hero({ stats }: { stats: PublicStats | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.045)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_75%_70%_at_65%_35%,black,transparent)]" />
        <div className="absolute -top-48 -right-32 size-160 rounded-full bg-mint/12 blur-3xl" />
        <div className="absolute -bottom-56 -left-40 size-144 rounded-full bg-info/20 blur-3xl" />
        <StreetMap className="absolute top-0 right-0 h-full w-full text-white/[0.07] lg:w-[62%]" />
      </div>
      <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div className="min-w-0 space-y-8">
          {stats && (
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-navy-foreground backdrop-blur">
              <LiveDot />
              {formatNumber(stats.openComplaints)} reports are being worked on in Dhaka right now
            </p>
          )}
          <h1 className="font-display text-[2.6rem] leading-[1.04] font-semibold text-white sm:text-6xl lg:text-[4rem]">
            <span className="block">
              <span className="whitespace-nowrap">Report it.</span> <span className="whitespace-nowrap">Track it.</span>
            </span>
            <span className="block text-mint italic">See it fixed.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-navy-muted">
            CityCare connects the people of Dhaka with the departments that fix roads, street lights, water lines and waste
            collection. You always know who is working on your report and when it is due.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-mint px-6 text-base text-navy shadow-[0_8px_24px_-8px_rgb(98_216_166/0.55)] hover:bg-mint/90">
              <Link href="/dashboard/complaints/new">
                Report a problem
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Link href="/track">
                <Search data-icon="inline-start" />
                Track a complaint
              </Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-navy-muted">
            {trust.map((item) => (
              <li key={item.text} className="inline-flex items-center gap-2">
                <item.icon className="size-4 text-mint" aria-hidden />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <LiveBoard stats={stats} />
      </div>
    </section>
  );
}
