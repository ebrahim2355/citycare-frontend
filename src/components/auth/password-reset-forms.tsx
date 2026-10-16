"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { PasswordField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations";

function Notice({ icon: Icon, title, children }: { icon: typeof MailCheck; title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const request = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => (await authApi.post<{ resetToken: string } | null>("forgot-password", values)).data,
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["email"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  if (request.isSuccess) {
    return (
      <Notice icon={MailCheck} title="Check your inbox">
        <p>If an account exists for {form.getValues("email")}, we sent a link to choose a new password. It works for 30 minutes.</p>
        {request.data?.resetToken && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-800 dark:text-amber-200">
            Email is not set up on this server, so here is the link:{" "}
            <Link href={`/reset-password?token=${request.data.resetToken}`} className="font-medium underline">
              reset your password
            </Link>
          </p>
        )}
        <Link href="/login" className="inline-block font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </Notice>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit((values) => request.mutate(values))} className="space-y-6">
      <FieldGroup>
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
      </FieldGroup>
      {form.formState.errors.root && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={request.isPending}>
        {request.isPending ? <Spinner /> : <KeyRound data-icon="inline-start" />}
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) => authApi.post("reset-password", { token, newPassword: values.newPassword }),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["newPassword"])) {
        const tokenProblem = isApiError(error) && error.fieldErrors.some((item) => item.field === "token");

        form.setError("root", { message: tokenProblem ? "This reset link is invalid or has expired. Ask for a new one." : error.message });
      }
    },
  });

  if (!token) {
    return (
      <Notice icon={KeyRound} title="This link is not complete">
        <p>The reset link has no token. Open the link from the email again, or ask for a new one.</p>
        <Link href="/forgot-password" className="inline-block font-medium text-primary hover:underline">
          Ask for a new link
        </Link>
      </Notice>
    );
  }

  if (reset.isSuccess) {
    return (
      <Notice icon={ShieldCheck} title="Your password was changed">
        <p>You can now sign in with the new password. You were signed out on your other devices.</p>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </Notice>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit((values) => reset.mutate(values))} className="space-y-6">
      <FieldGroup>
        <PasswordField
          control={form.control}
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          description="At least 8 characters with a letter and a number."
        />
        <PasswordField control={form.control} name="confirmPassword" label="Confirm new password" autoComplete="new-password" />
      </FieldGroup>
      {form.formState.errors.root && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}{" "}
          <Link href="/forgot-password" className="font-medium underline">
            Get a new link
          </Link>
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={reset.isPending}>
        {reset.isPending ? <Spinner /> : <ShieldCheck data-icon="inline-start" />}
        Save new password
      </Button>
    </form>
  );
}
