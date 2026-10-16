import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/options";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function ShellFallback() {
  return (
    <div className="flex min-h-dvh bg-muted/30" aria-busy="true" aria-label="Loading your dashboard">
      <div className="hidden w-64 shrink-0 space-y-3 border-r bg-sidebar p-4 lg:block">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
      <div className="flex-1 space-y-6 p-6 lg:p-8">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
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
