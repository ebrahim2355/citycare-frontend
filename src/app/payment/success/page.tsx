import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccess } from "@/components/payment/payment-result";
import { PaymentSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentSuccess />
    </Suspense>
  );
}
