"use client";

import { useQuery } from "@tanstack/react-query";
import { AlarmClock, CalendarClock, MapPinned, Navigation, Siren } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { LazyReportMap } from "@/components/map/lazy";
import type { MapFocus } from "@/components/map/report-map";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { RelativeTime } from "@/components/shared/relative-time";
import { EscalatedBadge, OverdueBadge, PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { directionsLink } from "@/lib/areas";
import { OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatNumber } from "@/lib/format";
import { complaintHref } from "@/lib/notifications";
import { catalogQueries, complaintQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { MapComplaint } from "@/types";

type TTeamRole = "STAFF" | "ADMIN";

const TEXT: Record<TTeamRole, { title: string; description: string }> = {
  STAFF: { title: "Jobs map", description: "Your open jobs where they are, the most urgent first. Tap one for directions." },
  ADMIN: { title: "City map", description: "Every report that has an exact spot. Red rings show work that missed its deadline." },
};

const urgency = (complaint: MapComplaint) => {
  const open = OPEN_STATUSES.includes(complaint.status);

  return [open && complaint.escalatedAt ? 0 : 1, open && complaint.isOverdue ? 0 : 1, complaint.dueAt ? Date.parse(complaint.dueAt) : Number.MAX_SAFE_INTEGER];
};

const byUrgency = (a: MapComplaint, b: MapComplaint) => {
  const left = urgency(a);
  const right = urgency(b);

  return (left[0] ?? 0) - (right[0] ?? 0) || (left[1] ?? 0) - (right[1] ?? 0) || (left[2] ?? 0) - (right[2] ?? 0);
};

function Chip({ icon: Icon, label, tone }: { icon: typeof MapPinned; label: string; tone?: "danger" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm font-medium",
        tone === "danger" && "border-red-300/70 text-red-700 dark:border-red-400/25 dark:text-red-300",
        tone === "warning" && "border-amber-300/70 text-amber-800 dark:border-amber-400/25 dark:text-amber-200"
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </span>
  );
}

function MapPopup({ complaint, role }: { complaint: MapComplaint; role: TTeamRole }) {
  const open = OPEN_STATUSES.includes(complaint.status);

  return (
    <div className="space-y-2">
      <p className="font-mono text-[11px] text-muted-foreground">{complaint.trackingCode}</p>
      <p className="leading-snug font-semibold">{complaint.title}</p>
      <p className="text-xs text-muted-foreground">
        {complaint.category.name} · {complaint.area}
        {role === "ADMIN" && ` · ${complaint.assignedStaff?.name ?? "Nobody assigned"}`}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        {open && complaint.escalatedAt && <EscalatedBadge />}
        {open && complaint.isOverdue && !complaint.escalatedAt && <OverdueBadge />}
      </div>
      {complaint.dueAt && open && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" aria-hidden />
          Due <RelativeTime value={complaint.dueAt} />
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild size="sm">
          <Link href={complaintHref(role, complaint.id)}>Open report</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={directionsLink(complaint.latitude, complaint.longitude)} target="_blank" rel="noreferrer">
            <Navigation data-icon="inline-start" />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}

export function ComplaintsMapView({ role }: { role: TTeamRole }) {
  const allId = useId();
  const [showAll, setShowAll] = useState(false);
  const [departmentId, setDepartmentId] = useState("all");
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const departments = useQuery({ ...catalogQueries.departments(), enabled: role === "ADMIN" });
  const map = useQuery(
    complaintQueries.map({ ...(showAll ? { status: "ALL" as const } : {}), ...(departmentId === "all" ? {} : { departmentId }) })
  );
  const items = useMemo(() => map.data ?? [], [map.data]);
  const byId = useMemo(() => new Map(items.map((complaint) => [complaint.id, complaint])), [items]);
  const ordered = useMemo(() => [...items].sort(byUrgency), [items]);
  const open = items.filter((complaint) => OPEN_STATUSES.includes(complaint.status));
  const overdue = open.filter((complaint) => complaint.isOverdue).length;
  const escalated = open.filter((complaint) => complaint.escalatedAt).length;

  return (
    <div className="space-y-6">
      <PageHeader title={TEXT[role].title} description={TEXT[role].description} />
      <div className="flex flex-wrap items-center gap-3">
        <Chip icon={MapPinned} label={map.data ? `${formatNumber(items.length)} on the map` : "Loading"} />
        {overdue > 0 && <Chip icon={AlarmClock} label={`${formatNumber(overdue)} overdue`} tone="danger" />}
        {escalated > 0 && <Chip icon={Siren} label={`${formatNumber(escalated)} escalated`} tone="warning" />}
        <div className="ml-auto flex flex-wrap items-center gap-4">
          {role === "ADMIN" && (
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-56" aria-label="Department">
                <SelectValue placeholder="Every department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Every department</SelectItem>
                {departments.data?.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <label htmlFor={allId} className="flex cursor-pointer items-center gap-2 text-sm">
            <Switch id={allId} checked={showAll} onCheckedChange={setShowAll} />
            Include finished work
          </label>
        </div>
      </div>
      {map.error && !map.data ? (
        <ErrorState error={map.error} onRetry={() => map.refetch()} retrying={map.isFetching} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <LazyReportMap
            points={items}
            focus={focus}
            label={TEXT[role].title}
            className="h-[26rem] sm:h-[36rem]"
            renderPopup={(id) => {
              const complaint = byId.get(id);

              return complaint ? <MapPopup complaint={complaint} role={role} /> : null;
            }}
          />
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">{role === "STAFF" ? "Next up" : "Needs attention first"}</CardTitle>
            </CardHeader>
            <ol className="max-h-[32rem] divide-y overflow-y-auto">
              {!map.data
                ? Array.from({ length: 5 }, (_, index) => (
                    <li key={index} className="space-y-2 p-4">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-2/5" />
                    </li>
                  ))
                : ordered.map((complaint) => (
                    <li key={complaint.id}>
                      <button
                        type="button"
                        onClick={() => setFocus({ id: complaint.id, nonce: Date.now() })}
                        className="w-full space-y-1.5 p-4 text-left transition-colors hover:bg-muted/60"
                      >
                        <span className="block text-sm leading-snug font-medium">{complaint.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {complaint.area} · {complaint.dueAt ? <RelativeTime value={complaint.dueAt} prefix="Due" /> : "No deadline yet"}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          <StatusBadge status={complaint.status} />
                          {OPEN_STATUSES.includes(complaint.status) && complaint.escalatedAt && <EscalatedBadge />}
                        </span>
                      </button>
                    </li>
                  ))}
              {map.data && !ordered.length && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  {role === "STAFF" ? "No open jobs with an exact spot right now." : "No reports with an exact spot match these filters."}
                </li>
              )}
            </ol>
            <p className="border-t p-4 text-xs text-muted-foreground">Reports without an exact spot are listed on the reports page only.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
