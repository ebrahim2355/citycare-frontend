"use client";

import { useQuery } from "@tanstack/react-query";
import { Crosshair, EyeOff, MapPinned, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SupportButton } from "@/components/community/support-button";
import { LazyReportMap } from "@/components/map/lazy";
import type { MapFocus } from "@/components/map/report-map";
import { ErrorState } from "@/components/shared/error-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { OverdueBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatNumber, pluralize } from "@/lib/format";
import { MAP_LEGEND, OVERDUE_RING } from "@/lib/map-style";
import { catalogQueries, communityQueries, type PublicReportFilters } from "@/lib/query/options";
import type { PublicReport } from "@/types";

type TStatus = NonNullable<PublicReportFilters["status"]>;

const STATUS_OPTIONS: { value: TStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Recently fixed" },
  { value: "ALL", label: "All" },
];

function ReportPopup({ report }: { report: PublicReport }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[11px] text-muted-foreground">{report.trackingCode}</p>
      <p className="leading-snug font-semibold">{report.title}</p>
      <p className="text-xs text-muted-foreground">
        {report.category.name} · {report.area}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={report.status} />
        {report.isOverdue && <OverdueBadge />}
      </div>
      <p className="text-xs text-muted-foreground">
        <RelativeTime value={report.createdAt} prefix="Reported" /> · {pluralize(report.supportCount, "supporter")}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild size="sm" variant="outline">
          <Link href={`/track?code=${report.trackingCode}`}>Track</Link>
        </Button>
        {OPEN_STATUSES.includes(report.status) && (
          <SupportButton
            complaintId={report.id}
            supportCount={report.supportCount}
            supported={report.supportedByMe}
            isMine={report.isMine}
            redirect="/map"
          />
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Map legend">
      {MAP_LEGEND.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} aria-hidden />
          {item.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full border-2 bg-muted" style={{ borderColor: OVERDUE_RING }} aria-hidden />
        Missed its deadline
      </li>
      <li className="flex items-center gap-1.5">
        <ThumbsUp className="size-3.5" aria-hidden />
        Bigger dot, more supporters
      </li>
    </ul>
  );
}

export function IssueMap() {
  const [status, setStatus] = useState<TStatus>("OPEN");
  const [categoryId, setCategoryId] = useState("all");
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const categories = useQuery(catalogQueries.categories({ type: "COMPLAINT" }));
  const reports = useQuery(communityQueries.publicReports({ status, ...(categoryId === "all" ? {} : { categoryId }) }));
  const items = useMemo(() => reports.data ?? [], [reports.data]);
  const byId = useMemo(() => new Map(items.map((report) => [report.id, report])), [items]);
  const ranked = useMemo(
    () => [...items].sort((a, b) => b.supportCount - a.supportCount || Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [items]
  );
  const openCount = items.filter((report) => OPEN_STATUSES.includes(report.status)).length;
  const overdueCount = items.filter((report) => report.isOverdue).length;

  const locate = () => {
    if (!ranked.length) {
      return;
    }

    if (!("geolocation" in navigator)) {
      toast.error("Your browser cannot share its location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closest = [...ranked].sort(
          (a, b) => Math.hypot(a.latitude - latitude, a.longitude - longitude) - Math.hypot(b.latitude - latitude, b.longitude - longitude)
        )[0];

        if (closest) {
          setFocus({ id: closest.id, nonce: Date.now() });
        }
      },
      (error) => {
        toast.error("Could not get your location", {
          description: error.code === error.PERMISSION_DENIED ? "Location access was blocked in the browser." : "Please try again in a moment.",
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            variant="outline"
            value={status}
            onValueChange={(value) => value && setStatus(value as TStatus)}
            aria-label="Which reports"
          >
            {STATUS_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-52" aria-label="Problem type">
              <SelectValue placeholder="Every problem type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every problem type</SelectItem>
              {categories.data?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={locate} disabled={!ranked.length} className="ml-auto">
            <Crosshair data-icon="inline-start" />
            Closest to me
          </Button>
        </div>
        {reports.error && !reports.data ? (
          <ErrorState error={reports.error} onRetry={() => reports.refetch()} retrying={reports.isFetching} />
        ) : (
          <div className="relative">
            <LazyReportMap
              points={items}
              focus={focus}
              label="City issue map"
              className="h-[26rem] sm:h-[34rem]"
              renderPopup={(id) => {
                const report = byId.get(id);

                return report ? <ReportPopup report={report} /> : null;
              }}
            />
            {reports.isFetching && (
              <span className="absolute top-3 right-3 z-[500] rounded-full border bg-card/95 px-3 py-1 text-xs font-medium shadow-sm">
                Updating
              </span>
            )}
          </div>
        )}
        <Legend />
      </div>
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-4.5 text-primary" aria-hidden />
              {reports.data ? `${formatNumber(items.length)} reports on the map` : "Loading reports"}
            </CardTitle>
            <CardDescription>
              {reports.data
                ? `${formatNumber(openCount)} still open, ${formatNumber(overdueCount)} past their deadline.`
                : "Reading the latest reports from the city."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="flex gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
              <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Only reports that their citizen made public are shown, at a rounded location. Names, phone numbers and addresses never appear here.
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Most supported</CardTitle>
          </CardHeader>
          <ol className="max-h-[30rem] divide-y overflow-y-auto">
            {!reports.data
              ? Array.from({ length: 5 }, (_, index) => (
                  <li key={index} className="space-y-2 p-4">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </li>
                ))
              : ranked.map((report) => (
                  <li key={report.id}>
                    <button
                      type="button"
                      onClick={() => setFocus({ id: report.id, nonce: Date.now() })}
                      className="w-full space-y-1.5 p-4 text-left transition-colors hover:bg-muted/60"
                    >
                      <span className="block text-sm leading-snug font-medium">{report.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {report.category.name} · {report.area}
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={report.status} />
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="size-3" aria-hidden />
                          {report.supportCount}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
            {reports.data && !ranked.length && (
              <li className="p-6 text-center text-sm text-muted-foreground">No public reports match these filters yet.</li>
            )}
          </ol>
        </Card>
      </aside>
    </div>
  );
}
