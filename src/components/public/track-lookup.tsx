"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CalendarClock, MapPin, SearchX, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProgressSteps } from "@/components/complaints/progress-steps";
import { TextField } from "@/components/forms/form-fields";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { OverdueBadge, PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { isApiError } from "@/lib/api/errors";
import { STATUS_META } from "@/lib/complaint-meta";
import { formatDate, formatDateTime } from "@/lib/format";
import { complaintQueries } from "@/lib/query/options";
import { trackSchema, type TrackValues } from "@/lib/validations";

const trackFilterSchema = z.object({ code: z.string().trim().toUpperCase().optional().catch(undefined) });

function TrackResult({ code }: { code: string }) {
  const { data, error, isPending, refetch, isFetching } = useQuery(complaintQueries.track(code));

  if (isPending) {
    return <Skeleton className="h-80 rounded-xl" />;
  }

  if (error) {
    if (isApiError(error) && (error.status === 404 || error.status === 400)) {
      return (
        <EmptyState
          icon={SearchX}
          title="No report with this code"
          description={`We could not find ${code}. Check the code in your confirmation email and try again.`}
        />
      );
    }

    return <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />;
  }

  const facts = [
    { icon: Tag, label: "Type", value: data.category.name },
    { icon: Building2, label: "Department", value: data.department.name },
    { icon: MapPin, label: "Area", value: data.area },
    { icon: CalendarClock, label: "Due", value: data.dueAt ? formatDateTime(data.dueAt) : "Starts after payment" },
  ];

  return (
    <Card className="animate-fade-up gap-6 p-6 shadow-raised">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-sm text-muted-foreground">{data.trackingCode}</p>
          <h2 className="text-xl font-semibold">{data.title}</h2>
          <p className="text-sm text-muted-foreground"><RelativeTime value={data.createdAt} prefix="Reported" /></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={data.status} />
          <PriorityBadge priority={data.priority} />
          {data.isOverdue && <OverdueBadge />}
        </div>
      </div>
      <ProgressSteps status={data.status} updates={data.updates} />
      <dl className="grid gap-4 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <fact.icon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="text-sm font-medium">{fact.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">History</h3>
        <ol className="space-y-3 border-l pl-5">
          {data.updates.map((update, index) => (
            <li key={`${update.toStatus}-${update.createdAt}-${index}`} className="relative">
              <span className="absolute top-1.5 -left-6.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
              <p className="text-sm font-medium">{STATUS_META[update.toStatus].label}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(update.createdAt)}</p>
            </li>
          ))}
        </ol>
      </div>
      {data.resolvedAt && <p className="text-sm text-muted-foreground">Resolved on {formatDate(data.resolvedAt)}.</p>}
    </Card>
  );
}

export function TrackLookup() {
  const { filters, setFilters } = useUrlFilters(trackFilterSchema);
  const form = useForm<TrackValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { code: filters.code ?? "" },
  });
  const code = filters.code && trackSchema.safeParse({ code: filters.code }).success ? filters.code : undefined;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up rounded-2xl border bg-card p-5 shadow-raised sm:p-6">
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => setFilters({ code: values.code.trim().toUpperCase() }))}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <TextField
            control={form.control}
            name="code"
            label="Tracking code"
            placeholder="CC-261017-AB12CD"
            autoComplete="off"
            className="sm:flex-1 [&_input]:h-11 [&_input]:font-mono [&_input]:uppercase"
          />
          <Button type="submit" size="lg" className="h-11 sm:mt-7">
            Track
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>
        {!code && (
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            You find the code in the confirmation email and on the report in your dashboard. Tracking shows the status and history
            only, never personal details.
          </p>
        )}
      </div>
      {code && <TrackResult code={code} />}
    </div>
  );
}
