import { ArrowRight, Building2, Clock3, CreditCard, RotateCcw, Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { heroPrimaryButton, PublicHero } from "@/components/layout/public-hero";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney, formatSla, pluralize } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { getCategories, getDepartments } from "@/lib/server/public-api";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export const metadata: Metadata = pageMetadata({
  title: "Services and fees",
  description: "Every complaint type and paid home service on CityCare, the department that handles it, its target time and its fee.",
  path: "/services",
});

function CategoryRow({ category }: { category: Category }) {
  const isService = category.type === "SERVICE";

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            isService ? "bg-brass/15 text-brass-strong" : "bg-accent text-accent-foreground"
          )}
        >
          <CategoryIcon name={category.name} className="size-4" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="font-medium">{category.name}</p>
          {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-11 text-sm sm:pl-0">
        <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {formatSla(category.slaHours)}
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
    </li>
  );
}

const paidSteps = [
  { icon: Send, title: "Send the request", text: "You see the fixed fee before anything is charged." },
  { icon: CreditCard, title: "Pay by card, bKash or Nagad", text: "The request goes to the department as soon as the payment is confirmed." },
  { icon: RotateCcw, title: "Refund if it does not happen", text: "If the city rejects it, the fee goes back to your card or wallet automatically." },
];

export default async function ServicesPage() {
  const [departments, categories] = await Promise.all([getDepartments(), getCategories()]);

  if (!departments || !categories) {
    return (
      <PublicHero
        page="Services"
        title="Services and fees"
        description="The service list could not be loaded right now. Please refresh in a moment."
      />
    );
  }

  const byDepartment = departments
    .map((department) => ({
      department,
      categories: categories.filter((category) => category.department.id === department.id),
    }))
    .filter((group) => group.categories.length > 0);

  const services = categories.filter((category) => category.type === "SERVICE");

  return (
    <>
      <PublicHero
        page="Services"
        title="What the city can help you with"
        description={`${categories.length} kinds of reports across ${byDepartment.length} departments. Each one has a target time. Paid services show the fee before you pay.`}
        actions={
          <Button asChild size="lg" className={heroPrimaryButton}>
            <Link href="/dashboard/complaints/new">
              Start a report
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <nav aria-label="Departments" className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="container-page flex gap-2 overflow-x-auto py-3 scrollbar-none mask-[linear-gradient(to_right,black_92%,transparent)]">
          {byDepartment.map(({ department }) => (
            <a
              key={department.id}
              href={`#${department.id}`}
              className="shrink-0 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
            >
              {department.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-page space-y-12 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {byDepartment.map(({ department, categories: items }) => (
            <Card key={department.id} id={department.id} className="reveal scroll-mt-36 gap-1 p-6">
              <div className="flex items-start gap-3 border-b pb-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white dark:bg-white/10">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="text-lg font-semibold">{department.name}</h2>
                    <span className="text-xs text-muted-foreground">{pluralize(items.length, "report type")}</span>
                  </div>
                  {department.description && <p className="text-sm text-muted-foreground">{department.description}</p>}
                </div>
              </div>
              <ul className="divide-y">
                {items.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {services.length > 0 && (
          <section aria-labelledby="paid-heading" className="reveal overflow-hidden rounded-2xl border border-brass/30 bg-brass/5">
            <div className="border-b border-brass/20 px-6 py-5 sm:px-8">
              <h2 id="paid-heading" className="font-display text-2xl font-semibold">
                How paid services work
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Three steps, with your money protected at each one.</p>
            </div>
            <ol className="grid gap-px bg-brass/20 md:grid-cols-3">
              {paidSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4 bg-card/80 p-6 sm:p-7">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-strong">
                    <step.icon className="size-4.5" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-semibold text-brass-strong">STEP {index + 1}</p>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  );
}
