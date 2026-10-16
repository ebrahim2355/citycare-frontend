import { Building2, CalendarCheck, CalendarClock, CircleDollarSign, ExternalLink, MapPin, RotateCcw, Tag, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mapLink } from "@/lib/areas";
import { OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatDateTime, formatMoney, formatRelative, formatSla } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintDetail } from "@/types";

function Fact({ icon: Icon, label, children, tone }: { icon: typeof Tag; label: string; children: ReactNode; tone?: "danger" }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn("text-sm font-medium break-words", tone === "danger" && "text-destructive")}>{children}</dd>
      </div>
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
              {isOpen && <span className="block text-xs font-normal text-muted-foreground">{formatRelative(complaint.dueAt)}</span>}
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
