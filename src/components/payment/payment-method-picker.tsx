"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId } from "react";
import { PaymentMethodMark } from "@/components/payment/payment-method-mark";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { firstAvailableMethod, isMethodAvailable, PAYMENT_METHOD_META, PAYMENT_METHODS } from "@/lib/payment-methods";
import { paymentQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

export function usePaymentMethods() {
  return useQuery(paymentQueries.methods());
}

export function PaymentMethodPicker({ value, onChange, disabled, className }: PaymentMethodPickerProps) {
  const id = useId();
  const methods = usePaymentMethods();
  const options = methods.data?.methods;

  useEffect(() => {
    const usable = firstAvailableMethod(options, value);

    if (usable !== value) {
      onChange(usable);
    }
  }, [options, value, onChange]);

  return (
    <RadioGroup
      value={value}
      onValueChange={(method) => onChange(method as PaymentMethod)}
      aria-label="Payment method"
      className={cn("gap-2", className)}
    >
      {PAYMENT_METHODS.map((method) => {
        const meta = PAYMENT_METHOD_META[method];
        const available = isMethodAvailable(options, method);

        return (
          <label
            key={method}
            htmlFor={`${id}-${method}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:border-primary/50",
              value === method && "border-primary bg-primary/5 ring-2 ring-primary/20",
              !available && "cursor-not-allowed opacity-60 hover:border-border"
            )}
          >
            <RadioGroupItem id={`${id}-${method}`} value={method} disabled={disabled || !available} />
            <PaymentMethodMark method={method} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{meta.label}</span>
              <span className="block text-xs text-muted-foreground">{available ? meta.hint : "Not available right now"}</span>
            </span>
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">{meta.provider}</span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
