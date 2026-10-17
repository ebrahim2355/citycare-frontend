"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, Clock, ReceiptText, Undo2 } from "lucide-react";
import { PaymentsBrowser } from "@/components/payments/payments-browser";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatMoney, formatNumber } from "@/lib/format";
import { queryKeys, statsQueries } from "@/lib/query/options";
import type { Payment } from "@/types";

function RefundAction({ payment }: { payment: Payment }) {
  const refund = useApiMutation({
    mutationFn: () => api.post(`/payments/${payment.id}/refund`),
    successMessage: `${formatMoney(payment.amount, payment.currency)} refunded to ${payment.citizen.name}`,
    invalidate: [queryKeys.payments, queryKeys.stats, queryKeys.complaints],
  });
  const refundable = payment.status === "COMPLETED" && (payment.complaint.status === "REJECTED" || payment.complaint.status === "CANCELLED");

  if (!refundable) {
    return null;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          <Undo2 data-icon="inline-start" />
          Refund
        </Button>
      }
      title="Refund this payment?"
      description={`${formatMoney(payment.amount, payment.currency)} goes back to ${payment.citizen.name} through Stripe. Refunds normally happen on their own when a paid request is rejected, so use this only when that refund failed.`}
      confirmLabel="Refund payment"
      pending={refund.isPending}
      onConfirm={() => refund.mutate()}
    />
  );
}

export function AdminPayments() {
  const stats = useQuery(statsQueries.admin());
  const payments = stats.data?.payments;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Every Stripe checkout for paid services, with refunds for requests that did not go ahead." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {payments ? (
          <>
            <StatCard label="Revenue" value={formatMoney(payments.revenue)} icon={CircleDollarSign} tone="emerald" />
            <StatCard label="Paid checkouts" value={formatNumber(payments.completed)} icon={ReceiptText} tone="teal" />
            <StatCard label="Open checkouts" value={formatNumber(payments.pending)} icon={Clock} tone="amber" hint="Started but not paid yet" />
            <StatCard
              label="Refunded"
              value={formatMoney(payments.refundedAmount)}
              icon={Undo2}
              tone="violet"
              hint={`${formatNumber(payments.refunded)} refunds`}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        )}
      </div>
      <PaymentsBrowser complaintBasePath="/admin/complaints" showCitizen rowActions={(payment) => <RefundAction payment={payment} />} />
    </div>
  );
}
