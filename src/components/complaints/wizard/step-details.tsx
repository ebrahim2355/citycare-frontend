"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { TextareaField, TextField } from "@/components/forms/form-fields";
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PRIORITY_META } from "@/lib/complaint-meta";
import { PRIORITIES } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { ComplaintValues } from "@/lib/validations";

const PRIORITY_HINTS = {
  LOW: "Can wait a few days",
  MEDIUM: "Needs attention this week",
  HIGH: "Causes trouble every day",
  URGENT: "Dangerous to people right now",
};

export function StepDetails({ form }: { form: UseFormReturn<ComplaintValues> }) {
  return (
    <FieldGroup>
      <TextField
        control={form.control}
        name="title"
        label="Short title"
        placeholder="For example: Deep pothole in front of the school gate"
        maxLength={120}
      />
      <TextareaField
        control={form.control}
        name="description"
        label="What is happening?"
        rows={6}
        maxLength={2000}
        placeholder="Describe the problem, since when it is there and who it affects."
      />
      <Controller
        control={form.control}
        name="priority"
        render={({ field, fieldState }) => (
          <FieldSet>
            <FieldLegend variant="label">How urgent is it?</FieldLegend>
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PRIORITIES.map((priority) => (
                <label
                  key={priority}
                  htmlFor={`priority-${priority}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/50",
                    field.value === priority && "border-primary bg-primary/5 ring-2 ring-primary/20"
                  )}
                >
                  <RadioGroupItem id={`priority-${priority}`} value={priority} className="mt-0.5" />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-semibold">{PRIORITY_META[priority].label}</span>
                    <span className="block text-xs text-muted-foreground">{PRIORITY_HINTS[priority]}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
            <FieldError errors={[fieldState.error]} />
          </FieldSet>
        )}
      />
    </FieldGroup>
  );
}
