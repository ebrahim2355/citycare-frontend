import type { Metadata } from "next";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";
import { IssueMap } from "@/components/public/issue-map";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "City issue map",
  description: "See the open problems reported around Dhaka on a live map, how long they have waited and how many neighbours they affect.",
  path: "/map",
});

export default function MapPage() {
  return (
    <>
      <PublicHero
        page="Issue map"
        title="What is broken around the city"
        description="Every public report with its location, colour coded by progress. Tap a dot to follow it, or add your voice if it affects you too."
        actions={
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard/complaints/new">Report a problem</Link>
          </Button>
        }
      />
      <div className="container-page py-10 sm:py-14">
        <IssueMap />
      </div>
    </>
  );
}
