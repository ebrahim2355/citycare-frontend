import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { RelativeTime } from "@/components/shared/relative-time";
import { FeeStatusBadge, OverdueBadge, PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { TrackingCode } from "@/components/shared/tracking-code";
import { Button } from "@/components/ui/button";
import type { ComplaintDetail } from "@/types";

interface ComplaintHeaderProps {
  complaint: ComplaintDetail;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
}

export function ComplaintHeader({ complaint, backHref, backLabel, actions }: ComplaintHeaderProps) {
  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href={backHref}>
          <ArrowLeft data-icon="inline-start" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <TrackingCode code={complaint.trackingCode} />
            <span className="text-sm text-muted-foreground"><RelativeTime value={complaint.createdAt} prefix="Reported" /></span>
          </div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold text-balance sm:text-[2.1rem]">{complaint.title}</h1>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.type === "SERVICE" && <FeeStatusBadge status={complaint.paymentStatus} />}
            {complaint.isOverdue && <OverdueBadge />}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
