"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, FilterX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PaymentMethodLabel } from "@/components/payment/payment-method-mark";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { PAYMENT_STATUS_META } from "@/lib/complaint-meta";
import { paymentFilterSchema } from "@/lib/filters";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PAYMENT_METHOD_META, PAYMENT_METHODS } from "@/lib/payment-methods";
import { paymentQueries } from "@/lib/query/options";
import type { Payment, PaymentStatus } from "@/types";

interface PaymentsBrowserProps {
  complaintBasePath: string;
  showCitizen?: boolean;
  rowActions?: (payment: Payment) => ReactNode;
  emptyAction?: ReactNode;
}

export function PaymentsBrowser({ complaintBasePath, showCitizen = false, rowActions, emptyAction }: PaymentsBrowserProps) {
  const { filters, setFilters, clearFilters } = useUrlFilters(paymentFilterSchema);
  const list = useQuery(paymentQueries.list(filters));

  const columns: Column<Payment>[] = [
    {
      key: "request",
      header: "Request",
      className: "min-w-56",
      cell: (payment) => (
        <Link href={`${complaintBasePath}/${payment.complaint.id}`} className="group block space-y-0.5">
          <span className="font-mono text-xs text-muted-foreground">{payment.complaint.trackingCode}</span>
          <span className="line-clamp-1 font-medium group-hover:text-primary group-hover:underline">{payment.complaint.title}</span>
          <span className="block text-xs text-muted-foreground">{payment.complaint.category.name}</span>
        </Link>
      ),
    },
    ...(showCitizen
      ? [
          {
            key: "citizen",
            header: "Citizen",
            cell: (payment: Payment) => (
              <div>
                <p className="font-medium">{payment.citizen.name}</p>
                <p className="text-xs text-muted-foreground">{payment.citizen.email}</p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "amount",
      header: "Amount",
      cell: (payment) => <span className="font-semibold tabular-nums">{formatMoney(payment.amount, payment.currency)}</span>,
    },
    { key: "method", header: "Method", cell: (payment) => <PaymentMethodLabel method={payment.method} className="text-sm" /> },
    { key: "status", header: "Status", cell: (payment) => <PaymentStatusBadge status={payment.status} /> },
    {
      key: "date",
      header: "Date",
      cell: (payment) => (
        <div className="text-sm">
          <p>{formatDateTime(payment.paidAt ?? payment.createdAt)}</p>
          {payment.refundedAt && <p className="text-xs text-muted-foreground">Refunded {formatDateTime(payment.refundedAt)}</p>}
        </div>
      ),
    },
    ...(rowActions ? [{ key: "actions", header: <span className="sr-only">Actions</span>, className: "w-12", cell: rowActions }] : []),
  ];

  const empty = filters.status || filters.method ? (
    <EmptyState
      icon={FilterX}
      title="No payments match these filters"
      action={
        <Button variant="outline" onClick={clearFilters}>
          Show all payments
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={CreditCard}
      title="No payments yet"
      description="Payments for paid services show up here with their receipt and any refund."
      action={emptyAction}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={filters.status}
          onChange={(status) => setFilters({ status })}
          placeholder="All statuses"
          label="Filter payments by status"
          options={(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((status) => ({
            value: status,
            label: PAYMENT_STATUS_META[status].label,
          }))}
        />
        <FilterSelect
          value={filters.method}
          onChange={(method) => setFilters({ method })}
          placeholder="All methods"
          label="Filter payments by method"
          options={PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_META[method].label }))}
        />
        <FilterSelect
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
          placeholder="Newest first"
          label="Sort payments"
          options={[{ value: "asc", label: "Oldest first" }]}
        />
      </div>
      {list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={list.data?.items}
            getRowKey={(payment) => payment.id}
            loading={list.isPending}
            fetching={list.isPlaceholderData}
            empty={empty}
            caption="Payments"
            renderMobile={(payment) => (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`${complaintBasePath}/${payment.complaint.id}`} className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{payment.complaint.trackingCode}</p>
                    <p className="line-clamp-2 font-medium">{payment.complaint.title}</p>
                  </Link>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">{formatMoney(payment.amount, payment.currency)}</span>
                    <PaymentMethodLabel method={payment.method} className="text-xs text-muted-foreground" />
                  </span>
                  <span className="text-muted-foreground">{formatDateTime(payment.paidAt ?? payment.createdAt)}</span>
                </div>
                {showCitizen && <p className="text-xs text-muted-foreground">{payment.citizen.name}</p>}
                {rowActions && <div className="flex justify-end">{rowActions(payment)}</div>}
              </div>
            )}
          />
          {list.data && <PaginationBar meta={list.data.meta} onPageChange={(page) => setFilters({ page })} label="payments" />}
        </>
      )}
    </div>
  );
}
