import { Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LostMapIllustration } from "@/components/shared/illustrations";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <header className="container-page flex h-18 items-center">
        <Logo tagline />
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center">
        <LostMapIllustration className="animate-fade-up" />
        <div className="animate-fade-up space-y-3 [animation-delay:100ms]">
          <p className="font-mono text-sm font-semibold tracking-[0.2em] text-primary">ERROR 404</p>
          <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">This street is not on our map</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            The page you are looking for does not exist or was moved. If you followed a link to a report, it may have been removed.
          </p>
        </div>
        <div className="flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:200ms]">
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
