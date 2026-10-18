import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelled } from "@/components/payment/payment-result";
import { PaymentSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentCancelled />
    </Suspense>
  );
}
