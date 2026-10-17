"use client";

import { cn } from "@/lib/utils";
import { showOverlay } from "@/stores/overlay-store";

export function GoogleButton({ redirect, className }: { redirect?: string | null; className?: string }) {
  const href = redirect ? `/api/auth/google?redirect=${encodeURIComponent(redirect)}` : "/api/auth/google";

  return (
    <a
      href={href}
      onClick={(event) => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
          showOverlay("Connecting to Google", "You choose the account on Google's own page");
        }
      }}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.3a12 12 0 0 0 0 10.9l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
      </svg>
      Continue with Google
    </a>
  );
}
