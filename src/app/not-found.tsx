import { Compass, Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page flex h-16 items-center">
        <Logo />
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Compass className="size-10" aria-hidden />
        </span>
        <div className="space-y-3">
          <p className="font-mono text-sm font-semibold text-primary">404</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">This street is not on our map</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            The page you are looking for does not exist or was moved. If you followed a link to a report, it may have been removed.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">
              <Home data-icon="inline-start" />
              Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/track">
              <Search data-icon="inline-start" />
              Track a report
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
