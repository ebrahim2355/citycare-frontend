import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { CitizenComplaintDetail } from "@/components/complaints/detail/citizen-complaint-detail";
import { prefetchComplaint } from "@/lib/server/prefetch";

export const metadata: Metadata = { title: "Report details" };

export default async function CitizenComplaintPage({ params }: PageProps<"/dashboard/complaints/[id]">) {
  const { id } = await params;
  const queryClient = await prefetchComplaint(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CitizenComplaintDetail id={id} />
    </HydrationBoundary>
  );
}
