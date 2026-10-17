"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { RouteProgress } from "@/components/layout/route-progress";
import { TransitionOverlay } from "@/components/layout/transition-overlay";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>
          <RouteProgress />
          {children}
          <TransitionOverlay />
          <Toaster closeButton position="top-right" />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
