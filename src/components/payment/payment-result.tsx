"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Clock, FileSearch, ReceiptText, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BrandLoader } from "@/components/shared/brand-loader";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "@/hooks/use-checkout";
import { api } from "@/lib/api/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query/options";
import type { Payment, PaymentCheck } from "@/types";

const SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;
const MAX_CHECKS = 6;

function Receipt({ payment }: { payment: Payment }) {
  const rows = [
    { label: "Request", value: payment.complaint.title },
    { label: "Tracking code", value: payment.complaint.trackingCode, mono: true },
    { label: "Service", value: payment.complaint.category.name },
    { label: "Date", value: formatDateTime(payment.paidAt ?? payment.updatedAt) },
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/30 text-sm">
      <div className="flex items-center justify-between gap-4 border-b border-dashed px-4 py-2.5">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Receipt</span>
        <span className="font-mono text-xs text-muted-foreground">{payment.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <dl className="divide-y divide-dashed">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className={row.mono ? "font-mono text-xs font-medium" : "text-right font-medium"}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between gap-4 border-t bg-card px-4 py-3">
        <span className="font-semibold">Amount</span>
        <span className="font-mono text-base font-semibold">{formatMoney(payment.amount, payment.currency)}</span>
      </div>
    </div>
  );
}

function SuccessMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-10" aria-hidden>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        strokeWidth="3.5"
        className="animate-draw-once stroke-emerald-600 dark:stroke-emerald-400"
        pathLength={1}
        strokeDasharray="1 1.1"
        transform="rotate(-90 32 32)"
      />
      <path
        d="m20 33 8 8 16-17"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-once stroke-emerald-600 [animation-delay:350ms] dark:stroke-emerald-400"
        pathLength={1}
        strokeDasharray="1 1.1"
      />
    </svg>
  );
}

function ResultShell({ icon, tone, title, text, children }: { icon: React.ReactNode; tone: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <Card className="mx-auto w-full max-w-lg animate-fade-up shadow-raised">
      <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-8">
        <span className={`flex size-18 items-center justify-center rounded-full ring-8 ${tone}`}>{icon}</span>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{text}</p>
        </div>
        {children && <div className="w-full space-y-4 text-left">{children}</div>}
      </CardContent>
    </Card>
  );
}

function MissingSession() {
  return (
    <ResultShell
      icon={<FileSearch className="size-8" />}
      tone="bg-muted text-muted-foreground ring-muted/50"
      title="No payment to show"
      text="This page opens after a Stripe checkout. Start a payment from your service request."
    >
      <Button asChild className="w-full">
        <Link href="/dashboard/complaints?status=PENDING_PAYMENT">See requests waiting for payment</Link>
      </Button>
    </ResultShell>
  );
}

export function PaymentSuccess() {
  const sessionId = useSearchParams().get("session_id") ?? "";
  const queryClient = useQueryClient();
  const valid = SESSION_PATTERN.test(sessionId);

  const check = useQuery({
    queryKey: ["payment-check", sessionId],
    queryFn: async () => (await api.post<PaymentCheck>("/payments/verify", { sessionId })).data,
    enabled: valid,
    retry: 1,
    refetchInterval: (query) => (query.state.data?.paid || query.state.dataUpdateCount >= MAX_CHECKS ? false : 2000),
  });

  const paid = check.data?.paid;

  useEffect(() => {
    if (paid) {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    }
  }, [paid, queryClient]);

  if (!valid) {
    return <MissingSession />;
  }

  if (check.error) {
    return <ErrorState error={check.error} onRetry={() => check.refetch()} retrying={check.isFetching} className="mx-auto max-w-lg" />;
  }

  if (!check.data) {
    return (
      <Card className="mx-auto w-full max-w-lg shadow-raised">
        <CardContent className="py-12">
          <BrandLoader title="Confirming your payment" description="We are checking with Stripe. This takes a few seconds." />
        </CardContent>
      </Card>
    );
  }

  const { payment } = check.data;

  if (!paid) {
    return (
      <ResultShell
        icon={<Clock className="size-8" />}
        tone="bg-amber-50 text-amber-600 ring-amber-50/60 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/5"
        title="Payment not confirmed yet"
        text="Stripe has not confirmed the payment. If you finished paying, it usually arrives within a minute."
      >
        <Receipt payment={payment} />
        <Button className="w-full" onClick={() => check.refetch()} disabled={check.isFetching}>
          {check.isFetching ? <Spinner /> : <RotateCcw data-icon="inline-start" />}
          Check again
        </Button>
      </ResultShell>
    );
  }

  return (
    <ResultShell
      icon={<SuccessMark />}
      tone="bg-emerald-50 ring-emerald-50/60 dark:bg-emerald-400/10 dark:ring-emerald-400/5"
      title="Payment successful"
      text="Thank you. Your service request is now with the department and the clock has started."
    >
      <Receipt payment={payment} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild>
          <Link href={`/dashboard/complaints/${payment.complaint.id}`}>Open the request</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/payments">
            <ReceiptText data-icon="inline-start" />
            All payments
          </Link>
        </Button>
      </div>
    </ResultShell>
  );
}

export function PaymentCancelled() {
  const sessionId = useSearchParams().get("session_id") ?? "";
  const valid = SESSION_PATTERN.test(sessionId);
  const checkout = useCheckout();

  const result = useQuery({
    queryKey: ["payment-cancel", sessionId],
    queryFn: async () => (await api.get<PaymentCheck>("/payments/cancel", { session_id: sessionId })).data,
    enabled: valid,
    retry: 1,
    staleTime: Infinity,
  });

  if (!valid) {
    return <MissingSession />;
  }

  if (result.error) {
    return <ErrorState error={result.error} onRetry={() => result.refetch()} retrying={result.isFetching} className="mx-auto max-w-lg" />;
  }

  if (!result.data) {
    return (
      <Card className="mx-auto w-full max-w-lg shadow-raised">
        <CardContent className="py-12">
          <BrandLoader title="Closing the checkout" description="One moment while we tell Stripe you left." />
        </CardContent>
      </Card>
    );
  }

  const { payment, paid } = result.data;

  if (paid) {
    return (
      <ResultShell
        icon={<CircleCheck className="size-8" />}
        tone="bg-emerald-50 text-emerald-600 ring-emerald-50/60 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/5"
        title="This checkout was already paid"
        text="Nothing else to do. Your request is with the department."
      >
        <Receipt payment={payment} />
        <Button asChild className="w-full">
          <Link href={`/dashboard/complaints/${payment.complaint.id}`}>Open the request</Link>
        </Button>
      </ResultShell>
    );
  }

  return (
    <ResultShell
      icon={<XCircle className="size-8" />}
      tone="bg-destructive/10 text-destructive ring-destructive/5"
      title="Payment cancelled"
      text="Nothing was charged. Your request is saved and waits for the payment."
    >
      <Receipt payment={payment} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={() => checkout.mutate(payment.complaint.id)} disabled={checkout.isPending || checkout.isSuccess}>
          {checkout.isPending || checkout.isSuccess ? <Spinner /> : <RotateCcw data-icon="inline-start" />}
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/complaints/${payment.complaint.id}`}>Open the request</Link>
        </Button>
      </div>
    </ResultShell>
  );
}
