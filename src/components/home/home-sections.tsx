import {
  ArrowRight,
  Building2,
  Camera,
  CircleCheck,
  ClipboardList,
  Clock3,
  HardHat,
  MapPinned,
  Route,
  Siren,
  Star,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CountUp } from "@/components/shared/count-up";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROGRESS_STEPS, STATUS_META } from "@/lib/complaint-meta";
import { OVERDUE_RING, STATUS_COLOR } from "@/lib/map-style";
import { formatMoney, formatNumber, formatSla } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, PublicStats } from "@/types";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}

export function SectionHeading({ eyebrow, title, description, align = "center" }: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn("reveal max-w-2xl space-y-4", centered && "mx-auto text-center")}>
      <p className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
        <span className="h-px w-6 bg-primary/50" aria-hidden />
        {eyebrow}
        {centered && <span className="h-px w-6 bg-primary/50" aria-hidden />}
      </p>
      <h2 className="font-display text-3xl font-semibold text-balance sm:text-[2.6rem] sm:leading-[1.12]">{title}</h2>
      {description && <p className="text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}

export function CityNumbers({ stats }: { stats: PublicStats | null }) {
  if (!stats) {
    return null;
  }

  const items = [
    { value: stats.resolvedComplaints, label: "Reports fixed and closed", note: "Checked by the people who sent them" },
    { value: stats.openComplaints, label: "Open right now", note: "Each one has a named owner" },
    { value: stats.departmentCount, label: "City departments", note: "Roads, water, waste, lights and parks" },
    { value: stats.serviceCount, label: "Kinds of report", note: "Free complaints and paid services" },
  ];

  return (
    <section aria-label="City numbers" className="border-b bg-card">
      <ul className="container-page grid grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <li
            key={item.label}
            className={cn(
              "reveal px-3 py-8 sm:px-6 sm:py-10",
              index % 2 === 1 && "border-l",
              index >= 2 && "border-t lg:border-t-0",
              index === 2 && "lg:border-l"
            )}
          >
            <p className="font-display text-4xl font-semibold tracking-tight lining-nums sm:text-5xl">
              <CountUp value={item.value} />
            </p>
            <p className="mt-2 text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
          </li>
        ))}
      </ul>
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

function StatusJourney() {
  return (
    <div className="reveal mx-auto mt-16 max-w-4xl rounded-2xl border bg-card p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-semibold">The same five steps for every report</p>
        <p className="text-sm text-muted-foreground">Paid services start once the fee is paid</p>
      </div>
      <ol className="mt-6 grid grid-cols-5">
        {PROGRESS_STEPS.map((step, index) => {
          const Icon = STATUS_META[step.status].icon;

          return (
            <li key={step.status} className="flex flex-col items-center gap-2.5 text-center">
              <div className="flex w-full items-center">
                <span className={cn("h-px flex-1", index > 0 && "bg-primary/35")} />
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-accent text-accent-foreground">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <span className={cn("h-px flex-1", index < PROGRESS_STEPS.length - 1 && "bg-primary/35")} />
              </div>
              <span className="px-1 text-xs font-medium sm:text-sm">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading
        eyebrow="How it works"
        title="From your street to a finished job"
        description="No phone queues and no lost paperwork. Every report has an owner and a clock."
      />
      <div className="relative mt-16">
        <div
          aria-hidden
          className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-linear-to-r from-transparent via-primary/35 to-transparent md:block"
        />
        <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="reveal flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full border bg-card text-primary shadow-card ring-8 ring-background">
                <step.icon className="size-6" aria-hidden />
              </span>
              <p className="mt-6 font-mono text-xs font-semibold tracking-[0.14em] text-primary">STEP {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-64 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <StatusJourney />
    </section>
  );
}

function CategoryTile({ category }: { category: Category }) {
  const isService = category.type === "SERVICE";

  return (
    <li className="reveal">
      <Link
        href={`/services#${category.department.id}`}
        className="card-hover group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 shadow-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-lg",
              isService ? "bg-brass/15 text-brass-strong" : "bg-accent text-accent-foreground"
            )}
          >
            <CategoryIcon name={category.name} className="size-5" />
          </span>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums",
              isService ? "border-brass/40 bg-brass/10 text-brass-strong" : "bg-muted/60 text-muted-foreground"
            )}
          >
            {isService ? formatMoney(category.fee) : "Free"}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold transition-colors group-hover:text-primary">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description ?? category.department.name}</p>
        </div>
        <p className="mt-auto flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {category.department.name} · within {formatSla(category.slaHours)}
        </p>
      </Link>
    </li>
  );
}

function CategoryGroup({ title, note, items, className }: { title: string; note: string; items: Category[]; className: string }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="reveal flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
      <ul className={cn("grid gap-4", className)}>
        {items.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </ul>
    </div>
  );
}

export function ServicesPreview({ categories, stats }: { categories: Category[] | null; stats: PublicStats | null }) {
  if (!categories?.length) {
    return null;
  }

  const reports = new Map(stats?.topCategories.map((item) => [item.categoryId, item.complaints]));
  const byReports = (a: Category, b: Category) => (reports.get(b.id) ?? 0) - (reports.get(a.id) ?? 0) || a.name.localeCompare(b.name);
  const complaints = categories.filter((category) => category.type === "COMPLAINT").sort(byReports).slice(0, 6);
  const services = categories.filter((category) => category.type === "SERVICE").sort(byReports).slice(0, 4);

  return (
    <section className="border-y bg-muted/40">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading
          eyebrow="What you can report"
          title="Free complaints and paid home services"
          description="Problems on public property are always free. Services at your home have a fixed fee shown up front."
        />
        <div className="mt-14 space-y-12">
          <CategoryGroup
            title="Complaints about public property"
            note="Always free, each with a target time"
            items={complaints}
            className="sm:grid-cols-2 lg:grid-cols-3"
          />
          <CategoryGroup
            title="Paid home services"
            note="Fixed fee before you pay, refunded if the city says no"
            items={services}
            className="sm:grid-cols-2 lg:grid-cols-4"
          />
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="bg-card">
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

function BarList({ items, label, barClassName }: { items: { name: string; value: number }[]; label: string; barClassName: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ol className="space-y-4" aria-label={label}>
      {items.map((item, index) => (
        <li key={item.name} className="grid grid-cols-[1.75rem_1fr] items-start gap-2">
          <span className="pt-0.5 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground tabular-nums">{formatNumber(item.value)} reports</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("reveal-bar h-full origin-left rounded-full", barClassName)} style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CityInsights({ stats }: { stats: PublicStats | null }) {
  if (!stats || (!stats.topAreas.length && !stats.topCategories.length)) {
    return null;
  }

  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading
        eyebrow="Open data"
        title="Where the city needs care"
        description="Live numbers from every report on CityCare. Personal details are never shown."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Card className="reveal gap-6 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-info/12 text-info">
              <MapPinned className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">Busiest areas</h3>
              <p className="text-sm text-muted-foreground">Where most reports come from</p>
            </div>
          </div>
          <BarList
            label="Reports by area"
            items={stats.topAreas.map((item) => ({ name: item.area, value: item.complaints }))}
            barClassName="bg-info"
          />
        </Card>
        <Card className="reveal gap-6 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ClipboardList className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">Most reported problems</h3>
              <p className="text-sm text-muted-foreground">What people report the most</p>
            </div>
          </div>
          <BarList
            label="Reports by category"
            items={stats.topCategories.map((item) => ({ name: item.name, value: item.complaints }))}
            barClassName="bg-primary"
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
    accent: "bg-primary",
    points: ["Report problems with photos and location", "Pay for home services with Stripe", "Track, rate and reopen your reports"],
  },
  {
    icon: HardHat,
    title: "Field staff",
    accent: "bg-brass",
    points: ["See your tasks sorted by deadline", "Start and resolve jobs with proof photos", "Pause new work when you are on leave"],
  },
  {
    icon: Building2,
    title: "City admins",
    accent: "bg-info",
    points: ["Assign by workload or move to another department", "Manage departments, services and fees", "Follow trends, refunds and the audit log"],
  },
];

export function RolesSection() {
  return (
    <section className="border-t bg-muted/40">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading eyebrow="One platform" title="Built for everyone who keeps the city running" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.title} className="reveal relative gap-5 p-6 sm:p-7">
              <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", role.accent)} />
              <span className="flex size-11 items-center justify-center rounded-lg bg-navy text-white dark:bg-white/10">
                <role.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-semibold">{role.title}</h3>
              <ul className="space-y-3">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm text-muted-foreground">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
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

const PREVIEW_DOTS = [
  { x: 92, y: 74, r: 9, color: STATUS_COLOR.IN_PROGRESS },
  { x: 168, y: 132, r: 12, color: STATUS_COLOR.SUBMITTED, overdue: true },
  { x: 236, y: 64, r: 8, color: STATUS_COLOR.ASSIGNED },
  { x: 306, y: 158, r: 10, color: STATUS_COLOR.RESOLVED },
  { x: 128, y: 214, r: 8, color: STATUS_COLOR.ASSIGNED },
  { x: 214, y: 236, r: 14, color: STATUS_COLOR.SUBMITTED },
  { x: 342, y: 96, r: 8, color: STATUS_COLOR.SUBMITTED },
  { x: 386, y: 222, r: 9, color: STATUS_COLOR.IN_PROGRESS, overdue: true },
  { x: 60, y: 168, r: 7, color: STATUS_COLOR.RESOLVED },
];

function MapPreview() {
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label="Preview of the city issue map" className="h-auto w-full">
      <rect width="440" height="300" rx="20" className="fill-navy" />
      <g className="stroke-white/10" strokeWidth="1">
        {Array.from({ length: 11 }, (_, index) => (
          <line key={`v${index}`} x1={index * 44} y1="0" x2={index * 44} y2="300" />
        ))}
        {Array.from({ length: 7 }, (_, index) => (
          <line key={`h${index}`} x1="0" y1={index * 50} x2="440" y2={index * 50} />
        ))}
      </g>
      <path d="M0 190 C 90 170, 150 120, 240 140 S 380 120, 440 70" className="fill-none stroke-white/25" strokeWidth="10" strokeLinecap="round" />
      <path d="M120 0 C 130 90, 110 160, 150 300" className="fill-none stroke-white/15" strokeWidth="7" strokeLinecap="round" />
      <path d="M300 300 C 290 220, 330 160, 320 0" className="fill-none stroke-white/15" strokeWidth="7" strokeLinecap="round" />
      {PREVIEW_DOTS.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={dot.color}
          stroke={dot.overdue ? OVERDUE_RING : "white"}
          strokeWidth={dot.overdue ? 3.5 : 2.5}
        />
      ))}
    </svg>
  );
}

export function MapTeaser() {
  const points = [
    { icon: MapPinned, text: "Every public report on one map, coloured by how far the work has come" },
    { icon: Siren, text: "A red ring shows when a report missed its deadline" },
    { icon: ThumbsUp, text: "Tap Me too when a problem affects you, so the crew sees how many people wait for it" },
  ];

  return (
    <section className="border-t bg-muted/40">
      <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Issue map"
            title="See what is broken around the city"
            description="Citizens choose to make their reports public. Names and contact details stay private, the problem does not."
            align="start"
          />
          <ul className="reveal space-y-3">
            {points.map((point) => (
              <li key={point.text} className="flex gap-3 text-sm sm:text-base">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <point.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1 text-muted-foreground">{point.text}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="reveal">
            <Link href="/map">
              Open the issue map
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="reveal overflow-hidden rounded-3xl border bg-card p-3 shadow-raised">
          <MapPreview />
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="container-page py-20 sm:py-24">
      <div className="reveal relative isolate overflow-hidden rounded-3xl border border-white/10 bg-navy px-6 py-14 text-center text-navy-foreground shadow-float sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div aria-hidden className="absolute -bottom-32 left-1/2 -z-10 h-64 w-160 -translate-x-1/2 rounded-full bg-mint/20 blur-3xl" />
        <h2 className="font-display text-3xl font-semibold text-balance text-white sm:text-[2.75rem]">Something broken on your street?</h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-navy-muted sm:text-lg">
          It takes two minutes to report it. You get a tracking code at once and an update every time it moves.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-mint px-6 text-base text-navy hover:bg-mint/90">
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
            <Link href="/register">Create a free account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
