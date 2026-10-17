import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminComplaintDetail } from "@/components/complaints/detail/admin-complaint-detail";
import { prefetchComplaint } from "@/lib/server/prefetch";

export const metadata: Metadata = { title: "Complaint details" };

export default async function AdminComplaintPage({ params }: PageProps<"/admin/complaints/[id]">) {
  const { id } = await params;
  const queryClient = await prefetchComplaint(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminComplaintDetail id={id} />
    </HydrationBoundary>
  );
}
