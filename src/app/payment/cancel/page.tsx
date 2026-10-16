import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelled } from "@/components/payment/payment-result";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-lg rounded-xl" />}>
      <PaymentCancelled />
    </Suspense>
  );
}
