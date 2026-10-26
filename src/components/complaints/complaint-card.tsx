import { CalendarClock, ChevronRight, MapPin, UserCheck } from "lucide-react";
import Link from "next/link";
import { RelativeTime } from "@/components/shared/relative-time";
import { EscalatedBadge, FeeStatusBadge, OverdueBadge, PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintListItem } from "@/types";

interface ComplaintCardProps {
  complaint: ComplaintListItem;
  href: string;
  showCitizen?: boolean;
  className?: string;
}

export function ComplaintCard({ complaint, href, showCitizen = false, className }: ComplaintCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs text-muted-foreground">{complaint.trackingCode}</p>
          <p className="line-clamp-2 font-semibold">{complaint.title}</p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        {complaint.type === "SERVICE" && <FeeStatusBadge status={complaint.paymentStatus} />}
        {complaint.isOverdue && <OverdueBadge />}
        {complaint.escalatedAt && complaint.isOverdue && <EscalatedBadge />}
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" aria-hidden />
          {complaint.area} · {complaint.category.name}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" aria-hidden />
          {OPEN_STATUSES.includes(complaint.status) && complaint.dueAt
            ? `Due ${formatDateTime(complaint.dueAt)}`
            : complaint.resolvedAt
              ? <RelativeTime value={complaint.resolvedAt} prefix="Resolved" />
              : <RelativeTime value={complaint.createdAt} prefix="Created" />}
        </span>
        {(showCitizen || complaint.assignedStaff) && (
          <span className="flex items-center gap-1.5 sm:col-span-2">
            <UserCheck className="size-3.5" aria-hidden />
            {showCitizen ? `By ${complaint.citizen.name}` : ""}
            {showCitizen && complaint.assignedStaff ? " · " : ""}
            {complaint.assignedStaff ? `Handled by ${complaint.assignedStaff.name}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
