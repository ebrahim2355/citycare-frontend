import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHero } from "@/components/layout/public-hero";
import { TrackLookup } from "@/components/public/track-lookup";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Track a report",
  description: "Enter your CityCare tracking code to see the status, the deadline and the history of a report.",
  path: "/track",
});

export default function TrackPage() {
  return (
    <>
      <PublicHero
        page="Track"
        title="Where is my report?"
        description="Every report gets a tracking code. Enter it to see where it is right now."
        className="pb-16 sm:pb-24"
      />
      <div className="container-page relative z-10 -mt-12 max-w-3xl pb-16 sm:-mt-16 sm:pb-20">
        <Suspense fallback={<Skeleton className="h-36 rounded-2xl" />}>
          <TrackLookup />
        </Suspense>
      </div>
    </>
  );
}
