import { Eye, FileClock, Gauge, HandCoins, Scale, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/home-sections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHours, formatNumber } from "@/lib/format";
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
      <section className="border-b bg-muted/30">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">About CityCare</p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">A shorter path from a broken street to a fixed one</h1>
            <p className="text-lg text-pretty text-muted-foreground">
              Reports to the city used to get lost between phone calls, offices and paper forms. CityCare gives every report one home: the
              citizen who sent it, the department that owns it and the staff member who fixes it all look at the same record.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Join CityCare</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">See the services</Link>
              </Button>
            </div>
          </div>
          {stats && (
            <dl className="grid grid-cols-2 gap-4">
              {[
                { label: "Reports on CityCare", value: formatNumber(stats.totalComplaints) },
                { label: "Fixed and closed", value: formatNumber(stats.resolvedComplaints) },
                { label: "Average time to fix", value: formatHours(stats.averageResolutionHours) },
                { label: "Kinds of service", value: formatNumber(stats.serviceCount) },
              ].map((item) => (
                <Card key={item.label} className="gap-1 p-6">
                  <dd className="text-3xl font-bold tracking-tight text-primary tabular-nums">{item.value}</dd>
                  <dt className="text-sm text-muted-foreground">{item.label}</dt>
                </Card>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Our rules" title="Six promises the platform keeps" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title} className="gap-3 p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <principle.icon className="size-5" aria-hidden />
              </span>
              <h2 className="font-semibold">{principle.title}</h2>
              <p className="text-sm text-muted-foreground">{principle.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {departments && departments.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="container-page py-20">
            <SectionHeading
              eyebrow="Departments"
              title="The teams behind the work"
              description="Every report goes straight to the department that owns the problem."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card key={department.id} className="gap-2 p-5">
                  <h3 className="font-semibold">{department.name}</h3>
                  {department.description && <p className="text-sm text-muted-foreground">{department.description}</p>}
                  <p className="text-xs font-medium text-primary">{department._count?.categories ?? 0} report types</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
