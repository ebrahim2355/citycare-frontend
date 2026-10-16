import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ComplaintWizard } from "@/components/complaints/wizard/complaint-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/options";
import { getCategories } from "@/lib/server/public-api";

export const metadata: Metadata = { title: "New report" };

export default async function NewComplaintPage() {
  await connection();

  const queryClient = getQueryClient();
  const categories = await getCategories();

  if (categories) {
    queryClient.setQueryData(queryKeys.categories({}), categories);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New report" description="Five short steps. Your answers are kept if you leave the page." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ComplaintWizard />
      </HydrationBoundary>
    </div>
  );
}
