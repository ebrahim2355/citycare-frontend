"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { showOverlay } from "@/stores/overlay-store";
import type { CheckoutResult } from "@/types";

export function useCheckout() {
  return useApiMutation({
    mutationFn: async (complaintId: string) =>
      (await api.post<CheckoutResult>("/payments/initiate", { complaintId, clientUrl: window.location.origin })).data,
    onSuccess: (result) => {
      showOverlay("Opening secure checkout", result.reused ? "Taking you back to your open Stripe checkout" : "Taking you to Stripe to pay");
      window.location.assign(result.checkoutUrl);
    },
  });
}
