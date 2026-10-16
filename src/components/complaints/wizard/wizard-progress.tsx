"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "@/stores/complaint-draft-store";

export const STEP_LABELS: Record<WizardStep, string> = {
  category: "What",
  details: "Details",
  location: "Where",
  photos: "Photos",
  review: "Review",
};

interface WizardProgressProps {
  current: WizardStep;
  onSelect: (step: WizardStep) => void;
}

export function WizardProgress({ current, onSelect }: WizardProgressProps) {
  const currentIndex = WIZARD_STEPS.indexOf(current);

  return (
    <nav aria-label="Report steps">
      <p className="mb-3 text-sm text-muted-foreground sm:hidden">
        Step {currentIndex + 1} of {WIZARD_STEPS.length}: <span className="font-medium text-foreground">{STEP_LABELS[current]}</span>
      </p>
      <ol className="grid grid-cols-5 gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => onSelect(step)}
                disabled={index > currentIndex}
                aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-not-allowed"
              >
                <span className={cn("h-1.5 rounded-full bg-muted transition-colors", (done || active) && "bg-primary")} />
                <span className="hidden items-center gap-2 text-sm sm:flex">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border text-xs font-semibold",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary text-primary",
                      !done && !active && "text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
                  </span>
                  <span className={cn("font-medium", !active && !done && "text-muted-foreground", done && "group-hover:underline")}>
                    {STEP_LABELS[step]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
