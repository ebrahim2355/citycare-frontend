"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeDollarSign, Clock3, MessageSquareWarning } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ErrorState } from "@/components/shared/error-state";
import { FieldError } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatSla } from "@/lib/format";
import { catalogQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { ComplaintValues } from "@/lib/validations";
import type { Category, CategoryType } from "@/types";

const KINDS: { value: CategoryType; title: string; text: string; icon: typeof MessageSquareWarning }[] = [
  { value: "COMPLAINT", title: "Report a problem", text: "Something broken on public property. Always free.", icon: MessageSquareWarning },
  { value: "SERVICE", title: "Request a service", text: "A city service at your home for a fixed fee.", icon: BadgeDollarSign },
];

interface StepCategoryProps {
  form: UseFormReturn<ComplaintValues>;
  kind: CategoryType;
  onKindChange: (kind: CategoryType) => void;
}

const groupByDepartment = (categories: Category[]) => {
  const groups = new Map<string, Category[]>();

  categories.forEach((category) => groups.set(category.department.name, [...(groups.get(category.department.name) ?? []), category]));

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
};

export function StepCategory({ form, kind, onKindChange }: StepCategoryProps) {
  const categories = useQuery(catalogQueries.categories());
  const visible = (categories.data ?? []).filter((category) => category.type === kind);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Kind of report">
        {KINDS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={kind === option.value}
            onClick={() => {
              onKindChange(option.value);

              const selected = categories.data?.find((category) => category.id === form.getValues("categoryId"));

              if (selected && selected.type !== option.value) {
                form.setValue("categoryId", "", { shouldValidate: false });
              }
            }}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50",
              kind === option.value && "border-primary bg-primary/5 ring-2 ring-primary/20"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <option.icon className="size-5" aria-hidden />
            </span>
            <span className="space-y-0.5">
              <span className="block font-semibold">{option.title}</span>
              <span className="block text-sm text-muted-foreground">{option.text}</span>
            </span>
          </button>
        ))}
      </div>

      {categories.isPending && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      )}
      {categories.error && <ErrorState error={categories.error} onRetry={() => categories.refetch()} />}

      {categories.data && (
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field, fieldState }) => (
            <div className="space-y-6">
              <RadioGroup value={field.value} onValueChange={field.onChange} aria-label="Category" className="gap-6">
                {groupByDepartment(visible).map(([department, items]) => (
                  <fieldset key={department} className="space-y-3">
                    <legend className="mb-3 text-sm font-semibold text-muted-foreground">{department}</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((category) => (
                        <label
                          key={category.id}
                          htmlFor={`category-${category.id}`}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50",
                            field.value === category.id && "border-primary bg-primary/5 ring-2 ring-primary/20"
                          )}
                        >
                          <RadioGroupItem id={`category-${category.id}`} value={category.id} className="mt-1" />
                          <span className="min-w-0 flex-1 space-y-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-medium">{category.name}</span>
                              {category.type === "SERVICE" && (
                                <span className="rounded-full bg-amber-500/14 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                                  {formatMoney(category.fee)}
                                </span>
                              )}
                            </span>
                            {category.description && <span className="block text-sm text-muted-foreground">{category.description}</span>}
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock3 className="size-3.5" aria-hidden />
                              Target time {formatSla(category.slaHours)}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />
      )}
    </div>
  );
}
