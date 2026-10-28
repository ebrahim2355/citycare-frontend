"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Lock, Undo2 } from "lucide-react";
import { useState } from "react";
import { PaymentMethodLabel } from "@/components/payment/payment-method-mark";
import { PaymentMethodPicker, usePaymentMethods } from "@/components/payment/payment-method-picker";
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
import { PAYMENT_METHOD_META } from "@/lib/payment-methods";
import { queryKeys } from "@/lib/query/options";
import type { ComplaintDetail, ComplaintPayment, PaymentMethod } from "@/types";

function RefundButton({ complaint, payment }: { complaint: ComplaintDetail; payment: ComplaintPayment }) {
  const queryClient = useQueryClient();
  const meta = PAYMENT_METHOD_META[payment.method];
  const refund = useApiMutation({
    mutationFn: () => api.post(`/payments/${payment.id}/refund`),
    successMessage: `Refund sent to ${meta.refundTo}`,
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
      description={`${formatMoney(payment.amount, payment.currency)} goes back to ${meta.refundTo} of the citizen through ${meta.provider}.`}
      confirmLabel="Refund payment"
      pending={refund.isPending}
      onConfirm={() => refund.mutate()}
    />
  );
}

function feeText(complaint: ComplaintDetail) {
  if (complaint.paymentStatus === "PAID") {
    return "Paid. The department has the request.";
  }

  if (complaint.paymentStatus === "REFUNDED") {
    const refunded = complaint.payments.find((payment) => payment.status === "REFUNDED");

    return `The fee was refunded to ${PAYMENT_METHOD_META[refunded?.method ?? "CARD"].refundTo}.`;
  }

  return "Not paid yet. The request waits until the fee is paid.";
}

function PayBox({ complaint }: { complaint: ComplaintDetail }) {
  const checkout = useCheckout();
  const methods = usePaymentMethods();
  const [method, setMethod] = useState<PaymentMethod>(complaint.payments[0]?.method ?? "CARD");
  const busy = checkout.isPending || checkout.isSuccess;
  const testMode = methods.data?.methods.find((option) => option.method === method)?.testMode ?? true;

  return (
    <div className="space-y-3">
      <PaymentMethodPicker value={method} onChange={setMethod} disabled={busy} />
      <Button size="lg" className="w-full" onClick={() => checkout.mutate({ complaintId: complaint.id, method })} disabled={busy}>
        {busy ? <Spinner /> : <Lock data-icon="inline-start" />}
        Pay {formatMoney(complaint.fee)} with {PAYMENT_METHOD_META[method].label}
      </Button>
      {testMode && <p className="text-center text-xs text-muted-foreground">{PAYMENT_METHOD_META[method].testHint}</p>}
    </div>
  );
}

export function PaymentPanel({ complaint }: { complaint: ComplaintDetail }) {
  const { user } = useSession();

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
        <CardDescription>{feeText(complaint)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-3xl font-bold tracking-tight tabular-nums">{formatMoney(complaint.fee)}</p>
        {canPay && <PayBox complaint={complaint} />}
        {complaint.payments.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {complaint.payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <div className="space-y-1">
                  <p className="font-medium tabular-nums">{formatMoney(payment.amount, payment.currency)}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <PaymentMethodLabel method={payment.method} />
                    <span>{formatDateTime(payment.paidAt ?? payment.createdAt)}</span>
                  </p>
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
