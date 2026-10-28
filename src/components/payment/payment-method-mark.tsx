import { CreditCard } from "lucide-react";
import { PAYMENT_METHOD_META } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

type Wallet = Exclude<PaymentMethod, "CARD">;

const WALLET_TONES: Record<Wallet, string> = {
  BKASH: "bg-[#c80f5c] text-white",
  NAGAD: "bg-[#c2410c] text-white",
};

const WALLET_GLYPHS: Record<Wallet, string> = {
  BKASH: "bK",
  NAGAD: "N",
};

interface PaymentMethodMarkProps {
  method: PaymentMethod;
  compact?: boolean;
  className?: string;
}

export function PaymentMethodMark({ method, compact = false, className }: PaymentMethodMarkProps) {
  const size = compact ? "size-6 rounded-md" : "size-9 rounded-lg";

  if (method === "CARD") {
    return (
      <span aria-hidden className={cn("flex shrink-0 items-center justify-center bg-primary/10 text-primary", size, className)}>
        <CreditCard className={compact ? "size-3.5" : "size-4.5"} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-bold tracking-tight",
        compact ? "text-[11px]" : "text-[10px]",
        WALLET_TONES[method],
        size,
        className
      )}
    >
      {compact ? WALLET_GLYPHS[method] : PAYMENT_METHOD_META[method].label}
    </span>
  );
}

export function PaymentMethodLabel({ method, className }: { method: PaymentMethod; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PaymentMethodMark method={method} compact />
      <span>{PAYMENT_METHOD_META[method].label}</span>
    </span>
  );
}
