"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { getErrorText } from "@/lib/api/errors";
import { getQueryClient } from "@/lib/query/client";
import { getAreaRole } from "@/lib/roles";

const Devtools = dynamic(() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools), { ssr: false });

let redirecting = false;

export function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(() =>
    getQueryClient({
      onUnauthorized: () => {
        const { pathname, search } = window.location;

        if (!getAreaRole(pathname) || redirecting) {
          return;
        }

        redirecting = true;
        toast.error("Your session has ended", { description: "Please sign in again to continue." });
        router.replace(`/login?redirect=${encodeURIComponent(`${pathname}${search}`)}`);
        router.refresh();
        setTimeout(() => {
          redirecting = false;
        }, 3000);
      },
      onError: (error) => {
        const { title, description } = getErrorText(error);

        toast.error(title, { description });
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <Devtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
