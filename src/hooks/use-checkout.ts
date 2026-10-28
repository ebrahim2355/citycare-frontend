"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { PAYMENT_METHOD_META } from "@/lib/payment-methods";
import { showOverlay } from "@/stores/overlay-store";
import type { CheckoutResult, PaymentMethod } from "@/types";

interface CheckoutInput {
  complaintId: string;
  method: PaymentMethod;
}

export const checkoutDestination = (method: PaymentMethod) => (method === "CARD" ? "Stripe" : PAYMENT_METHOD_META[method].label);

export const startCheckout = async ({ complaintId, method }: CheckoutInput) =>
  (await api.post<CheckoutResult>("/payments/initiate", { complaintId, method, clientUrl: window.location.origin })).data;

export function useCheckout() {
  return useApiMutation({
    mutationFn: startCheckout,
    onSuccess: (result, { method }) => {
      const destination = checkoutDestination(method);

      showOverlay(
        "Opening secure checkout",
        result.reused ? `Taking you back to your open ${destination} checkout` : `Taking you to ${destination} to pay`
      );
      window.location.assign(result.checkoutUrl);
    },
  });
}
