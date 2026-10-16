"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Clock, FileSearch, Loader2, ReceiptText, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
    { label: "Amount", value: formatMoney(payment.amount, payment.currency) },
    { label: "Date", value: formatDateTime(payment.paidAt ?? payment.updatedAt) },
  ];

  return (
    <dl className="divide-y rounded-xl border text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className={row.mono ? "font-mono text-xs font-medium" : "text-right font-medium"}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResultShell({ icon, tone, title, text, children }: { icon: React.ReactNode; tone: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
        <span className={`flex size-16 items-center justify-center rounded-full ${tone}`}>{icon}</span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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
      tone="bg-muted text-muted-foreground"
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
      <ResultShell
        icon={<Loader2 className="size-8 animate-spin" />}
        tone="bg-primary/10 text-primary"
        title="Confirming your payment"
        text="We are checking with Stripe. This takes a few seconds."
      />
    );
  }

  const { payment } = check.data;

  if (!paid) {
    return (
      <ResultShell
        icon={<Clock className="size-8" />}
        tone="bg-amber-500/12 text-amber-600"
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
      icon={<CircleCheck className="size-8" />}
      tone="bg-emerald-500/12 text-emerald-600"
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
      <ResultShell
        icon={<Loader2 className="size-8 animate-spin" />}
        tone="bg-primary/10 text-primary"
        title="Closing the checkout"
        text="One moment while we tell Stripe you left."
      />
    );
  }

  const { payment, paid } = result.data;

  if (paid) {
    return (
      <ResultShell
        icon={<CircleCheck className="size-8" />}
        tone="bg-emerald-500/12 text-emerald-600"
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
      tone="bg-destructive/10 text-destructive"
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
