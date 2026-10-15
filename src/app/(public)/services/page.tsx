import { ArrowRight, BadgeDollarSign, Building2, Clock3, MessageSquareWarning } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney, formatSla } from "@/lib/format";
import { getCategories, getDepartments } from "@/lib/server/public-api";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Services and fees",
  description: "Every complaint type and paid home service on CityCare, the department that handles it, its target time and its fee.",
  alternates: { canonical: "/services" },
};

function CategoryRow({ category }: { category: Category }) {
  const isService = category.type === "SERVICE";

  return (
    <li className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-2 font-medium">
          {isService ? (
            <BadgeDollarSign className="size-4 shrink-0 text-amber-600" aria-hidden />
          ) : (
            <MessageSquareWarning className="size-4 shrink-0 text-sky-600" aria-hidden />
          )}
          {category.name}
        </p>
        {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock3 className="size-4" aria-hidden />
          {formatSla(category.slaHours)}
        </span>
        <span
          className={
            isService
              ? "rounded-full bg-amber-500/14 px-3 py-1 font-semibold text-amber-800 dark:text-amber-200"
              : "rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground"
          }
        >
          {isService ? formatMoney(category.fee) : "Free"}
        </span>
      </div>
    </li>
  );
}

export default async function ServicesPage() {
  const [departments, categories] = await Promise.all([getDepartments(), getCategories()]);

  if (!departments || !categories) {
    return (
      <div className="container-page py-16">
        <PageHeader title="Services and fees" description="The service list could not be loaded right now. Please refresh in a moment." />
      </div>
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
    <div className="container-page space-y-12 py-12 sm:py-16">
      <PageHeader
        eyebrow="Services"
        title="What the city can help you with"
        description={`${categories.length} kinds of reports across ${byDepartment.length} departments. Each one has a target time. Paid services show the fee before you pay.`}
        actions={
          <Button asChild size="lg">
            <Link href="/dashboard/complaints/new">
              Start a report
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <nav aria-label="Departments" className="flex flex-wrap gap-2">
        {byDepartment.map(({ department }) => (
          <a
            key={department.id}
            href={`#${department.id}`}
            className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {department.name}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {byDepartment.map(({ department, categories: items }) => (
          <Card key={department.id} id={department.id} className="scroll-mt-24 gap-2 p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">{department.name}</h2>
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
        <Card className="gap-4 border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">How paid services work</h2>
          <ol className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            <li>
              <span className="font-semibold text-foreground">1. Send the request.</span> You see the fixed fee before anything is
              charged.
            </li>
            <li>
              <span className="font-semibold text-foreground">2. Pay with Stripe.</span> The request goes to the department as soon as the
              payment is confirmed.
            </li>
            <li>
              <span className="font-semibold text-foreground">3. Refund if it does not happen.</span> If the city rejects it, the fee goes
              back to your card automatically.
            </li>
          </ol>
        </Card>
      )}
    </div>
  );
}
