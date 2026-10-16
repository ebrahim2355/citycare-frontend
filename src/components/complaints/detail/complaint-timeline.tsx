import { ProgressSteps } from "@/components/complaints/progress-steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_META } from "@/lib/complaint-meta";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { ComplaintDetail } from "@/types";

export function ComplaintTimeline({ complaint }: { complaint: ComplaintDetail }) {
  const updates = [...complaint.updates].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>Every change to this report, newest first</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <ProgressSteps status={complaint.status} updates={complaint.updates} />
        <ol className="relative space-y-6 border-l pl-6">
          {updates.map((update, index) => {
            const meta = STATUS_META[update.toStatus];
            const Icon = meta.icon;
            const sameStatus = update.fromStatus === update.toStatus;

            return (
              <li key={update.id} className="relative">
                <span
                  className={cn(
                    "absolute top-0 -left-[37px] flex size-7 items-center justify-center rounded-full ring-4 ring-card",
                    index === 0 ? meta.className : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{sameStatus ? "Updated" : meta.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(update.createdAt)}
                    {update.actor && ` · ${update.actor.name} (${ROLE_LABEL[update.actor.role]})`}
                  </p>
                  {update.note && <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm whitespace-pre-line">{update.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
