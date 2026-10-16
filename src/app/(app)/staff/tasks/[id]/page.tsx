import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { StaffComplaintDetail } from "@/components/complaints/detail/staff-complaint-detail";
import { prefetchComplaint } from "@/lib/server/prefetch";

export const metadata: Metadata = { title: "Task details" };

export default async function StaffTaskPage({ params }: PageProps<"/staff/tasks/[id]">) {
  const { id } = await params;
  const queryClient = await prefetchComplaint(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffComplaintDetail id={id} />
    </HydrationBoundary>
  );
}
