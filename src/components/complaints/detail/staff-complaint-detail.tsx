"use client";

import { useQuery } from "@tanstack/react-query";
import { AlarmClock } from "lucide-react";
import { AttachmentGallery } from "@/components/complaints/detail/attachment-gallery";
import { ComplaintDiscussion } from "@/components/complaints/detail/complaint-discussion";
import { ComplaintHeader } from "@/components/complaints/detail/complaint-header";
import { ComplaintDescription, ComplaintFacts, ComplaintMap } from "@/components/complaints/detail/complaint-info";
import { ComplaintTimeline } from "@/components/complaints/detail/complaint-timeline";
import { PersonCard } from "@/components/complaints/detail/person-card";
import { StaffActions } from "@/components/complaints/detail/staff-actions";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/page-skeleton";
import { RatingStars } from "@/components/shared/rating-stars";
import { RelativeTime } from "@/components/shared/relative-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { complaintQueries } from "@/lib/query/options";

export function StaffComplaintDetail({ id }: { id: string }) {
  const { data: complaint, error, refetch, isFetching } = useQuery(complaintQueries.detail(id));

  if (error && !complaint) {
    return <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />;
  }

  if (!complaint) {
    return <DetailPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ComplaintHeader complaint={complaint} backHref="/staff/tasks" backLabel="My tasks" actions={<StaffActions complaint={complaint} />} />
      {complaint.isOverdue && complaint.dueAt && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm">
          <AlarmClock className="size-4 text-destructive" aria-hidden />
          This job passed its target time <RelativeTime value={complaint.dueAt} />. Please update the citizen with a note when you resolve it.
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ComplaintDescription complaint={complaint} />
          <AttachmentGallery complaint={complaint} />
          <ComplaintTimeline complaint={complaint} />
          <ComplaintDiscussion complaintId={complaint.id} />
        </div>
        <div className="space-y-6">
          <PersonCard title="Reported by" person={complaint.citizen} />
          {complaint.feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Citizen rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RatingStars value={complaint.feedback.rating} size={20} />
                {complaint.feedback.comment && <p className="text-sm text-muted-foreground">“{complaint.feedback.comment}”</p>}
              </CardContent>
            </Card>
          )}
          <ComplaintMap complaint={complaint} />
          <ComplaintFacts complaint={complaint} />
        </div>
      </div>
    </div>
  );
}
