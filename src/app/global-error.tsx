"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans text-foreground">
        <main role="alert" className="max-w-md space-y-5 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">CityCare</p>
          <h1 className="text-3xl font-bold tracking-tight">The app could not start</h1>
          <p className="text-muted-foreground">
            Something broke before the page could load. Please try again. If it keeps happening, come back in a few minutes.
          </p>
          {error.digest && <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85"
            >
              Try again
            </button>
            <Link href="/" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
