import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { BrandLoader } from "@/components/shared/brand-loader";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/options";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function ShellFallback() {
  return <BrandLoader fullScreen delayed title="Preparing your workspace" description="Checking your session and loading your desk" />;
}

async function SessionShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const queryClient = getQueryClient();

  queryClient.setQueryData(queryKeys.session, user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShell user={user}>{children}</AppShell>
    </HydrationBoundary>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <SessionShell>{children}</SessionShell>
    </Suspense>
  );
}
