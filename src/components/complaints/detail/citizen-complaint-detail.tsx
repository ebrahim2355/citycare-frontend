"use client";

import { useQuery } from "@tanstack/react-query";
import { HardHat } from "lucide-react";
import { AttachmentGallery } from "@/components/complaints/detail/attachment-gallery";
import { CitizenActions } from "@/components/complaints/detail/citizen-actions";
import { ComplaintHeader } from "@/components/complaints/detail/complaint-header";
import { ComplaintDescription, ComplaintFacts, ComplaintMap } from "@/components/complaints/detail/complaint-info";
import { ComplaintTimeline } from "@/components/complaints/detail/complaint-timeline";
import { PaymentPanel } from "@/components/complaints/detail/payment-panel";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/page-skeleton";
import { RatingStars } from "@/components/shared/rating-stars";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { complaintQueries } from "@/lib/query/options";

export function CitizenComplaintDetail({ id }: { id: string }) {
  const { data: complaint, error, refetch, isFetching } = useQuery(complaintQueries.detail(id));

  if (error && !complaint) {
    return <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />;
  }

  if (!complaint) {
    return <DetailPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ComplaintHeader
        complaint={complaint}
        backHref="/dashboard/complaints"
        backLabel="My reports"
        actions={<CitizenActions complaint={complaint} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ComplaintDescription complaint={complaint} />
          <ComplaintTimeline complaint={complaint} />
          <AttachmentGallery complaint={complaint} />
        </div>
        <div className="space-y-6">
          <PaymentPanel complaint={complaint} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="size-4.5 text-primary" aria-hidden />
                Who is on it
              </CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.assignedStaff ? (
                <div className="flex items-center gap-3">
                  <UserAvatar name={complaint.assignedStaff.name} size={40} />
                  <div>
                    <p className="font-medium">{complaint.assignedStaff.name}</p>
                    <p className="text-sm text-muted-foreground">{complaint.department.name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {complaint.status === "PENDING_PAYMENT"
                    ? "A staff member is chosen after the fee is paid."
                    : "Not assigned yet. The city team assigns reports by workload."}
                </p>
              )}
            </CardContent>
          </Card>
          {complaint.feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Your rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RatingStars value={complaint.feedback.rating} size={20} />
                {complaint.feedback.comment && <p className="text-sm text-muted-foreground">“{complaint.feedback.comment}”</p>}
                <p className="text-xs text-muted-foreground">Given on {formatDate(complaint.feedback.createdAt)}</p>
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
