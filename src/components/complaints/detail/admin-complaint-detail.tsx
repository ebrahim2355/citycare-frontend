"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminActions } from "@/components/complaints/detail/admin-actions";
import { AttachmentGallery } from "@/components/complaints/detail/attachment-gallery";
import { ComplaintHeader } from "@/components/complaints/detail/complaint-header";
import { ComplaintDescription, ComplaintFacts } from "@/components/complaints/detail/complaint-info";
import { ComplaintTimeline } from "@/components/complaints/detail/complaint-timeline";
import { PaymentPanel } from "@/components/complaints/detail/payment-panel";
import { PersonCard } from "@/components/complaints/detail/person-card";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/page-skeleton";
import { RatingStars } from "@/components/shared/rating-stars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { complaintQueries } from "@/lib/query/options";

export function AdminComplaintDetail({ id }: { id: string }) {
  const { data: complaint, error, refetch, isFetching } = useQuery(complaintQueries.detail(id));

  if (error && !complaint) {
    return <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />;
  }

  if (!complaint) {
    return <DetailPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ComplaintHeader complaint={complaint} backHref="/admin/complaints" backLabel="All complaints" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ComplaintDescription complaint={complaint} />
          <ComplaintTimeline complaint={complaint} />
          <AttachmentGallery complaint={complaint} />
        </div>
        <div className="space-y-6">
          <AdminActions complaint={complaint} />
          <PaymentPanel complaint={complaint} />
          <PersonCard title="Citizen" person={complaint.citizen} />
          <PersonCard
            title="Staff member"
            person={complaint.assignedStaff}
            note={complaint.status === "PENDING_PAYMENT" ? "Assigned after the fee is paid." : "Nobody is assigned yet."}
          />
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
          <ComplaintFacts complaint={complaint} />
        </div>
      </div>
    </div>
  );
}
