"use client";

import { useQuery } from "@tanstack/react-query";
import { BadgeDollarSign, CircleDollarSign, ReceiptText } from "lucide-react";
import Link from "next/link";
import { PaymentsBrowser } from "@/components/payments/payments-browser";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumber } from "@/lib/format";
import { statsQueries } from "@/lib/query/options";

export function CitizenPayments() {
  const stats = useQuery(statsQueries.citizen());

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Fees you paid for city services, with refunds when a request did not go ahead." />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.data ? (
          <>
            <StatCard label="Total paid" value={formatMoney(stats.data.payments.totalPaid)} icon={CircleDollarSign} tone="emerald" />
            <StatCard label="Successful payments" value={formatNumber(stats.data.payments.completed)} icon={ReceiptText} tone="teal" />
            <StatCard
              label="Waiting for payment"
              value={formatNumber(stats.data.awaitingPayment)}
              icon={BadgeDollarSign}
              tone="amber"
              href="/dashboard/complaints?status=PENDING_PAYMENT"
            />
          </>
        ) : (
          Array.from({ length: 3 }, (_, index) => <StatCardSkeleton key={index} />)
        )}
      </div>
      <PaymentsBrowser
        complaintBasePath="/dashboard/complaints"
        emptyAction={
          <Button asChild variant="outline">
            <Link href="/services">See the paid services</Link>
          </Button>
        }
      />
    </div>
  );
}
