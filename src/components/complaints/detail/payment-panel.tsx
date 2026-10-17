"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Lock, Undo2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useCheckout } from "@/hooks/use-checkout";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query/options";
import type { ComplaintDetail, ComplaintPayment } from "@/types";

function RefundButton({ complaint, payment }: { complaint: ComplaintDetail; payment: ComplaintPayment }) {
  const queryClient = useQueryClient();
  const refund = useApiMutation({
    mutationFn: () => api.post(`/payments/${payment.id}/refund`),
    successMessage: "Refund sent to the card",
    invalidate: [queryKeys.complaint(complaint.id), queryKeys.payments, queryKeys.stats],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.complaints }),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button size="xs" variant="outline">
          <Undo2 data-icon="inline-start" />
          Refund
        </Button>
      }
      title="Refund this payment?"
      description={`${formatMoney(payment.amount, payment.currency)} goes back to the citizen card through Stripe.`}
      confirmLabel="Refund payment"
      pending={refund.isPending}
      onConfirm={() => refund.mutate()}
    />
  );
}

export function PaymentPanel({ complaint }: { complaint: ComplaintDetail }) {
  const { user } = useSession();
  const checkout = useCheckout();

  if (complaint.type !== "SERVICE") {
    return null;
  }

  const canPay = user?.role === "CITIZEN" && complaint.status === "PENDING_PAYMENT" && complaint.paymentStatus === "UNPAID";

  return (
    <Card className={canPay ? "border-amber-500/40" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4.5 text-primary" aria-hidden />
          Service fee
        </CardTitle>
        <CardDescription>
          {complaint.paymentStatus === "PAID"
            ? "Paid. The department has the request."
            : complaint.paymentStatus === "REFUNDED"
              ? "The fee was refunded to the card."
              : "Not paid yet. The request waits until the fee is paid."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-3xl font-bold tracking-tight tabular-nums">{formatMoney(complaint.fee)}</p>
        {canPay && (
          <div className="space-y-2">
            <Button size="lg" className="w-full" onClick={() => checkout.mutate(complaint.id)} disabled={checkout.isPending || checkout.isSuccess}>
              {checkout.isPending || checkout.isSuccess ? <Spinner /> : <Lock data-icon="inline-start" />}
              Pay {formatMoney(complaint.fee)} with Stripe
            </Button>
            <p className="text-center text-xs text-muted-foreground">Test mode: card 4242 4242 4242 4242, any future date, any CVC.</p>
          </div>
        )}
        {complaint.payments.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {complaint.payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium tabular-nums">{formatMoney(payment.amount, payment.currency)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(payment.paidAt ?? payment.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === "ADMIN" && payment.status === "COMPLETED" && (complaint.status === "REJECTED" || complaint.status === "CANCELLED") && (
                    <RefundButton complaint={complaint} payment={payment} />
                  )}
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
