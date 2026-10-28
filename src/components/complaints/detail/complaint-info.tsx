import { Building2, CalendarCheck, CalendarClock, CircleDollarSign, ExternalLink, MapPin, Navigation, RotateCcw, Tag, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { LazyLocationPreview } from "@/components/map/lazy";
import { RelativeTime } from "@/components/shared/relative-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { directionsLink, mapLink } from "@/lib/areas";
import { OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatDateTime, formatMoney, formatSla } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintDetail } from "@/types";

function Fact({ icon: Icon, label, children, tone }: { icon: typeof Tag; label: string; children: ReactNode; tone?: "danger" }) {
  return (
    <div className="relative min-h-8 min-w-0 pl-11">
      <dt className="text-xs text-muted-foreground">
        <span className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        {label}
      </dt>
      <dd className={cn("text-sm font-medium break-words", tone === "danger" && "text-destructive")}>{children}</dd>
    </div>
  );
}

export function ComplaintDescription({ complaint }: { complaint: ComplaintDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{complaint.description}</p>
        {complaint.resolutionNote && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">What the staff did</p>
            <p className="mt-1 text-sm whitespace-pre-line">{complaint.resolutionNote}</p>
          </div>
        )}
        {complaint.rejectionReason && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-4">
            <p className="text-sm font-semibold text-destructive">Why it was rejected</p>
            <p className="mt-1 text-sm whitespace-pre-line">{complaint.rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ComplaintMap({ complaint }: { complaint: ComplaintDetail }) {
  if (complaint.latitude === null || complaint.longitude === null) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4.5 text-primary" aria-hidden />
          Exact spot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <LazyLocationPreview
          latitude={complaint.latitude}
          longitude={complaint.longitude}
          label={`Map of ${complaint.address}, ${complaint.area}`}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
          <a
            href={directionsLink(complaint.latitude, complaint.longitude)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Navigation className="size-3" aria-hidden />
            Get directions
          </a>
          <a
            href={mapLink(complaint.latitude, complaint.longitude)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            OpenStreetMap
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplaintFacts({ complaint }: { complaint: ComplaintDetail }) {
  const isOpen = OPEN_STATUSES.includes(complaint.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4">
          <Fact icon={Tag} label="Type">
            {complaint.category.name} · target {formatSla(complaint.category.slaHours)}
          </Fact>
          <Fact icon={Building2} label="Department">
            {complaint.department.name}
          </Fact>
          <Fact icon={MapPin} label="Location">
            {complaint.address}, {complaint.area}
            {complaint.latitude !== null && complaint.longitude !== null && (
              <a
                href={mapLink(complaint.latitude, complaint.longitude)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open the exact spot on the map
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </Fact>
          {complaint.dueAt && (
            <Fact icon={CalendarClock} label={isOpen ? "Due" : "Was due"} tone={complaint.isOverdue ? "danger" : undefined}>
              {formatDateTime(complaint.dueAt)}
              {isOpen && <span className="block text-xs font-normal text-muted-foreground"><RelativeTime value={complaint.dueAt} /></span>}
            </Fact>
          )}
          {complaint.assignedAt && (
            <Fact icon={Timer} label="Assigned">
              {formatDateTime(complaint.assignedAt)}
            </Fact>
          )}
          {complaint.resolvedAt && (
            <Fact icon={CalendarCheck} label="Resolved">
              {formatDateTime(complaint.resolvedAt)}
            </Fact>
          )}
          {complaint.type === "SERVICE" && (
            <Fact icon={CircleDollarSign} label="Service fee">
              {formatMoney(complaint.fee)}
            </Fact>
          )}
          {complaint.reopenCount > 0 && (
            <Fact icon={RotateCcw} label="Reopened">
              {complaint.reopenCount} {complaint.reopenCount === 1 ? "time" : "times"}
            </Fact>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
