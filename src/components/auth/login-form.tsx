"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Rocket } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useSignIn } from "@/hooks/use-sign-in";
import { isApiError } from "@/lib/api/errors";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/demo-accounts";
import { applyServerErrors } from "@/lib/forms";
import { loginSchema, type LoginValues } from "@/lib/validations";

const describeError = (error: unknown) => {
  if (!isApiError(error)) {
    return "Something went wrong. Please try again.";
  }

  return error.description ? `${error.message}. ${error.description}` : error.message;
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const googleError = searchParams.get("error");
  const [demoRole, setDemoRole] = useState<DemoAccount["role"] | null>(null);
  const signIn = useSignIn("login");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const submit = (values: LoginValues, role: DemoAccount["role"] | null = null) => {
    setDemoRole(role);
    form.clearErrors("root");
    signIn.mutate(
      { ...values, redirect },
      {
        onError: (error) => {
          if (!applyServerErrors(error, form.setError, ["email", "password"])) {
            form.setError("root", { message: describeError(error) });
          }
        },
        onSettled: () => setDemoRole(null),
      }
    );
  };

  const busy = signIn.isPending || signIn.isSuccess;
  const rootError = form.formState.errors.root?.message ?? (googleError ? `Google sign in failed. ${googleError}` : null);

  return (
    <div className="space-y-7">
      <form noValidate onSubmit={form.handleSubmit((values) => submit(values))} className="space-y-5">
        <FieldGroup>
          <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <PasswordField control={form.control} name="password" label="Password" />
        </FieldGroup>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        {rootError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {rootError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {signIn.isPending && !demoRole ? <Spinner /> : <LogIn data-icon="inline-start" />}
          Sign in
        </Button>
        <GoogleButton redirect={redirect} />
      </form>

      <div className="flex items-center gap-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        or try a demo account
        <span className="h-px flex-1 bg-border" />
      </div>

      <section aria-labelledby="demo-heading" className="space-y-4">
        <div className="text-center">
          <h2 id="demo-heading" className="flex items-center justify-center gap-2 font-semibold">
            <Rocket className="size-4 text-primary" aria-hidden />
            Quick demo login
          </h2>
          <p className="text-sm text-muted-foreground">One click signs you in as each role.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.role}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-center shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-raised"
            >
              <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-navy text-white transition-colors group-hover:bg-primary dark:bg-white/10">
                <account.icon className="size-5" aria-hidden />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{account.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{account.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-auto w-full"
                disabled={busy}
                onClick={() => submit({ email: account.email, password: account.password }, account.role)}
                aria-label={`Demo login as ${account.label}`}
              >
                {demoRole === account.role && <Spinner />}
                Demo login
              </Button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        New to CityCare?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
