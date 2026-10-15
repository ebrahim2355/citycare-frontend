import { Check } from "lucide-react";
import { PROGRESS_STEPS, progressIndex, STATUS_META } from "@/lib/complaint-meta";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/types";

interface ProgressStepsProps {
  status: ComplaintStatus;
  updates: { toStatus: ComplaintStatus; createdAt: string }[];
  className?: string;
}

const lastReached = (updates: ProgressStepsProps["updates"]) => {
  const reached = new Map<ComplaintStatus, string>();

  updates.forEach((update) => reached.set(update.toStatus, update.createdAt));

  return reached;
};

export function ProgressSteps({ status, updates, className }: ProgressStepsProps) {
  const stopped = status === "REJECTED" || status === "CANCELLED";
  const reached = lastReached(updates);
  const current = stopped
    ? Math.max(...updates.map((update) => progressIndex(update.toStatus)), 0)
    : status === "PENDING_PAYMENT"
      ? -1
      : progressIndex(status);

  return (
    <div className={cn("space-y-3", className)}>
      <ol className="grid grid-cols-5 gap-1" aria-label="Progress">
        {PROGRESS_STEPS.map((step, index) => {
          const done = index < current || (index === current && (status === "CLOSED" || stopped));
          const active = index === current && !stopped && status !== "CLOSED";

          return (
            <li key={step.status} className="flex flex-col items-center gap-2 text-center" aria-current={active ? "step" : undefined}>
              <div className="flex w-full items-center">
                <span className={cn("h-0.5 flex-1", index === 0 ? "bg-transparent" : index <= current ? "bg-primary" : "bg-border")} />
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                    !done && !active && "border-border bg-card text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    index === PROGRESS_STEPS.length - 1 ? "bg-transparent" : index < current ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
              <div className="space-y-0.5">
                <p className={cn("text-[11px] font-medium sm:text-xs", index <= current ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                {reached.get(step.status) && index <= current && (
                  <p className="hidden text-[11px] text-muted-foreground sm:block">{formatShortDate(reached.get(step.status))}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {(stopped || status === "PENDING_PAYMENT") && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            stopped ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-800 dark:text-amber-200"
          )}
        >
          {STATUS_META[status].label}. {STATUS_META[status].description}
        </p>
      )}
    </div>
  );
}
