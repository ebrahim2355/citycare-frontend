"use client";

import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
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
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong here</h1>
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
