import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackLookup } from "@/components/public/track-lookup";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Track a report",
  description: "Enter your CityCare tracking code to see the status, the deadline and the history of a report.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="container-page max-w-3xl space-y-8 py-12 sm:py-16">
      <PageHeader
        eyebrow="Track"
        title="Where is my report?"
        description="Every report gets a tracking code. Enter it to see where it is right now."
      />
      <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
        <TrackLookup />
      </Suspense>
    </div>
  );
}
