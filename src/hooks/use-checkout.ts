"use client";

import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import type { CheckoutResult } from "@/types";

export function useCheckout() {
  return useApiMutation({
    mutationFn: async (complaintId: string) =>
      (await api.post<CheckoutResult>("/payments/initiate", { complaintId, clientUrl: window.location.origin })).data,
    onSuccess: (result) => {
      toast.info(result.reused ? "Opening your open checkout" : "Taking you to Stripe to pay");
      window.location.assign(result.checkoutUrl);
    },
  });
}
