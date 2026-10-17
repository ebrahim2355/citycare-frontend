"use client";

import { Pencil, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { PriorityBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatSla } from "@/lib/format";
import type { ComplaintValues } from "@/lib/validations";
import type { WizardStep } from "@/stores/complaint-draft-store";
import type { Category } from "@/types";

interface StepReviewProps {
  values: ComplaintValues;
  category: Category | undefined;
  photos: File[];
  onEdit: (step: WizardStep) => void;
}

function Section({ title, step, onEdit, children }: { title: string; step: WizardStep; onEdit: StepReviewProps["onEdit"]; children: React.ReactNode }) {
  return (
    <section className="space-y-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${title.toLowerCase()}`}>
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
      </div>
      {children}
    </section>
  );
}

export function StepReview({ values, category, photos, onEdit }: StepReviewProps) {
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  return (
    <div className="space-y-4">
      <Section title="What" step="category" onEdit={onEdit}>
        {category ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                {category.department.name} · target time {formatSla(category.slaHours)}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {category.type === "SERVICE" ? formatMoney(category.fee) : "Free"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-destructive">Choose a category first.</p>
        )}
      </Section>
      <Section title="Details" step="details" onEdit={onEdit}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{values.title}</p>
          <PriorityBadge priority={values.priority} />
        </div>
        <p className="text-sm whitespace-pre-line text-muted-foreground">{values.description}</p>
      </Section>
      <Section title="Where" step="location" onEdit={onEdit}>
        <p className="font-medium">
          {values.address}, {values.area}
        </p>
        {values.latitude !== undefined && values.longitude !== undefined && (
          <p className="text-sm text-muted-foreground">
            Exact location: {values.latitude.toFixed(4)}, {values.longitude.toFixed(4)}
          </p>
        )}
      </Section>
      <Section title="Photos" step="photos" onEdit={onEdit}>
        {previews.length ? (
          <div className="flex flex-wrap gap-2">
            {previews.map((url, index) => (
              <div key={url} className="relative size-20 overflow-hidden rounded-lg border">
                <Image src={url} alt={`Photo ${index + 1}`} fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No photos. You can add them later from the report page.</p>
        )}
      </Section>
      {category?.type === "SERVICE" && (
        <div className="flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-400/25 dark:bg-amber-400/10 text-sm">
          <ShieldCheck className="size-5 shrink-0 text-amber-600" aria-hidden />
          <p>
            You will pay <span className="font-semibold">{formatMoney(category.fee)}</span> on the next screen with Stripe. The request reaches
            the department as soon as the payment is confirmed, and the fee is refunded if the city rejects it.
          </p>
        </div>
      )}
    </div>
  );
}
