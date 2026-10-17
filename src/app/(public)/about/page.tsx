import { Building2, Eye, FileClock, Gauge, HandCoins, Scale, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/home-sections";
import { heroOutlineButton, heroPrimaryButton, PublicHero } from "@/components/layout/public-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHours, formatNumber, pluralize } from "@/lib/format";
import { getDepartments, getPublicStats } from "@/lib/server/public-api";

export const metadata: Metadata = {
  title: "About",
  description: "Why CityCare exists, how reports move through the city departments and the rules that keep the work fair and open.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    icon: Eye,
    title: "Open by default",
    text: "Anyone can follow a report with its tracking code, and the city numbers on the home page are live. Names and phone numbers stay private.",
  },
  {
    icon: Gauge,
    title: "A clock on every report",
    text: "Each type of problem has a target time. Reports that pass it are marked overdue for the admins and the staff member.",
  },
  {
    icon: Scale,
    title: "Fair workload",
    text: "Automatic assignment picks the staff member with the fewest active jobs, and nobody gets more than their limit.",
  },
  {
    icon: HandCoins,
    title: "Money back when it does not happen",
    text: "Paid services are refunded to the card automatically if the request is rejected or cancelled.",
  },
  {
    icon: FileClock,
    title: "Every action is recorded",
    text: "Assignments, status changes, refunds and role changes are kept in an audit log that admins can review.",
  },
  {
    icon: Users,
    title: "The citizen has the last word",
    text: "A job is closed when you rate it. If the problem comes back, you can reopen it within seven days.",
  },
];

export default async function AboutPage() {
  const [stats, departments] = await Promise.all([getPublicStats(), getDepartments()]);

  return (
    <>
      <PublicHero
        page="About"
        title="A shorter path from a broken street to a fixed one"
        description="Reports to the city used to get lost between phone calls, offices and paper forms. CityCare gives every report one home: the citizen who sent it, the department that owns it and the staff member who fixes it all look at the same record."
        actions={
          <>
            <Button asChild size="lg" className={heroPrimaryButton}>
              <Link href="/register">Join CityCare</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={heroOutlineButton}>
              <Link href="/services">See the services</Link>
            </Button>
          </>
        }
        aside={
          stats && (
            <dl className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Reports on CityCare", value: formatNumber(stats.totalComplaints) },
                { label: "Fixed and closed", value: formatNumber(stats.resolvedComplaints) },
                { label: "Average time to fix", value: formatHours(stats.averageResolutionHours) },
                { label: "Kinds of service", value: formatNumber(stats.serviceCount) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <dt className="text-sm text-navy-muted">{item.label}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-white tabular-nums lining-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
          )
        }
      />

      <section className="container-page py-20 sm:py-24">
        <SectionHeading eyebrow="Our rules" title="Six promises the platform keeps" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <Card key={principle.title} className="reveal gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <principle.icon className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="text-lg font-semibold">{principle.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{principle.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {departments && departments.length > 0 && (
        <section className="border-t bg-muted/40">
          <div className="container-page py-20 sm:py-24">
            <SectionHeading
              eyebrow="Departments"
              title="The teams behind the work"
              description="Every report goes straight to the department that owns the problem."
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card key={department.id} className="reveal flex-row gap-4 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white dark:bg-white/10">
                    <Building2 className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="font-semibold">{department.name}</h3>
                    {department.description && <p className="text-sm text-muted-foreground">{department.description}</p>}
                    <p className="text-xs font-medium text-primary">{pluralize(department._count?.categories ?? 0, "report type")}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
