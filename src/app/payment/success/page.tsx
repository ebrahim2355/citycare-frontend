import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccess } from "@/components/payment/payment-result";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-lg rounded-xl" />}>
      <PaymentSuccess />
    </Suspense>
  );
}
