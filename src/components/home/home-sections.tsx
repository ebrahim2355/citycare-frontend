import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  ClipboardList,
  HardHat,
  MapPinned,
  MessageSquareText,
  Route,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHours, formatMoney, formatNumber, formatSla } from "@/lib/format";
import type { Category, PublicStats } from "@/types";

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-3 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}

export function StatsStrip({ stats }: { stats: PublicStats | null }) {
  if (!stats) {
    return null;
  }

  const items = [
    { label: "Reports handled", value: formatNumber(stats.totalComplaints) },
    { label: "Resolution rate", value: `${stats.resolutionRate}%` },
    { label: "Average time to fix", value: formatHours(stats.averageResolutionHours) },
    { label: "City departments", value: formatNumber(stats.departmentCount) },
  ];

  return (
    <section aria-label="City numbers" className="border-b bg-card">
      <dl className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <dd className="text-3xl font-bold tracking-tight text-primary tabular-nums sm:text-4xl">{item.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

const steps = [
  {
    icon: Camera,
    title: "Report with photos",
    text: "Pick the problem, add the address and up to six photos. A service request shows its fee before you pay.",
  },
  {
    icon: Route,
    title: "The right team gets it",
    text: "Your report goes to the department in charge. An admin assigns a field staff member with free capacity.",
  },
  {
    icon: ClipboardList,
    title: "Follow every step",
    text: "See who is working on it, when it is due and every status change in one timeline.",
  },
  {
    icon: Star,
    title: "Rate or reopen",
    text: "Rate the work when it is done. Not fixed? Reopen it within seven days and it goes back to the team.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow="How it works"
        title="From your street to a finished job"
        description="No phone queues and no lost paperwork. Every report has an owner and a clock."
      />
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card className="h-full gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ServicesPreview({ categories }: { categories: Category[] | null }) {
  const complaints = (categories ?? []).filter((category) => category.type === "COMPLAINT").slice(0, 6);
  const services = (categories ?? []).filter((category) => category.type === "SERVICE").slice(0, 4);

  if (!categories?.length) {
    return null;
  }

  return (
    <section className="border-y bg-muted/30">
      <div className="container-page py-20">
        <SectionHeading
          eyebrow="What you can report"
          title="Free complaints and paid home services"
          description="Problems on public property are always free. Services at your home have a fixed fee shown up front."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="gap-5 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-sky-500/12 text-sky-700 dark:text-sky-300">
                <MessageSquareText className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">Complaints</h3>
                <p className="text-sm text-muted-foreground">Free, with a target time for each type</p>
              </div>
            </div>
            <ul className="divide-y">
              {complaints.map((category) => (
                <li key={category.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{category.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{category.department.name}</p>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">within {formatSla(category.slaHours)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="gap-5 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/14 text-amber-700 dark:text-amber-300">
                <BadgeCheck className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">Paid services</h3>
                <p className="text-sm text-muted-foreground">Pay online. Refunded if the city rejects it</p>
              </div>
            </div>
            <ul className="divide-y">
              {services.map((category) => (
                <li key={category.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{category.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{category.description ?? category.department.name}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                    {formatMoney(category.fee)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              See all services and departments
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function BarList({ items, label }: { items: { name: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="space-y-3" aria-label={label}>
      {items.map((item) => (
        <li key={item.name} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span className="text-muted-foreground tabular-nums">{formatNumber(item.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CityInsights({ stats }: { stats: PublicStats | null }) {
  if (!stats || (!stats.topAreas.length && !stats.topCategories.length)) {
    return null;
  }

  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow="Open data"
        title="Where the city needs care"
        description="Live numbers from every report on CityCare. Personal details are never shown."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card className="gap-5 p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <MapPinned className="size-5 text-primary" aria-hidden />
            Busiest areas
          </h3>
          <BarList label="Reports by area" items={stats.topAreas.map((item) => ({ name: item.area, value: item.complaints }))} />
        </Card>
        <Card className="gap-5 p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="size-5 text-primary" aria-hidden />
            Most reported problems
          </h3>
          <BarList
            label="Reports by category"
            items={stats.topCategories.map((item) => ({ name: item.name, value: item.complaints }))}
          />
        </Card>
      </div>
    </section>
  );
}

const roles = [
  {
    icon: UserRound,
    title: "Citizens",
    points: ["Report problems with photos and location", "Pay for home services with Stripe", "Track, rate and reopen your reports"],
  },
  {
    icon: HardHat,
    title: "Field staff",
    points: ["See your tasks sorted by deadline", "Start and resolve jobs with proof photos", "Pause new work when you are on leave"],
  },
  {
    icon: Building2,
    title: "City admins",
    points: ["Assign by workload or move to another department", "Manage departments, services and fees", "Follow trends, refunds and the audit log"],
  },
];

export function RolesSection() {
  return (
    <section className="border-t bg-muted/30">
      <div className="container-page py-20">
        <SectionHeading eyebrow="One platform" title="Built for everyone who keeps the city running" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.title} className="gap-4 p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <role.icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold">{role.title}</h3>
              <ul className="space-y-2.5">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="container-page py-20">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(30rem_15rem_at_50%_120%,rgb(255_255_255/0.18),transparent)]"
        />
        <h2 className="relative text-3xl font-bold tracking-tight text-balance sm:text-4xl">Something broken on your street?</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-pretty opacity-90">
          It takes two minutes to report it. You get a tracking code at once and an update every time it moves.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="h-11 px-6 text-base">
            <Link href="/dashboard/complaints/new">Report a problem</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-primary-foreground/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/register">Create a free account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
