"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TrackingCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Tracking code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy tracking code ${code}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-muted",
        className
      )}
    >
      {code}
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-muted-foreground" />}
    </button>
  );
}
