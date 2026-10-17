"use client";

import { Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { RoadworksIllustration } from "@/components/shared/illustrations";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
}

export function RouteError({ error, reset, homeHref = "/" }: RouteErrorProps) {
  useEffect(() => {
    toast.error("This page could not load", { description: "You can try again without losing your place." });
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-lg animate-fade-in flex-col items-center gap-6 px-4 py-16 text-center">
      <RoadworksIllustration />
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-destructive">SOMETHING WENT WRONG</p>
        <h1 className="font-display text-3xl font-semibold">We hit a bump in the road</h1>
        <p className="text-muted-foreground">
          The page hit an unexpected problem. It is usually a short network hiccup between CityCare and the city servers.
        </p>
        {error.digest && <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href={homeHref}>
            <Home data-icon="inline-start" />
            Go back home
          </Link>
        </Button>
      </div>
    </div>
  );
}
