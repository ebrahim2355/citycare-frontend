"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PasswordField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useSignIn } from "@/hooks/use-sign-in";
import { applyServerErrors } from "@/lib/forms";
import { registerSchema, type RegisterValues } from "@/lib/validations";

export function RegisterForm() {
  const signUp = useSignIn("register");
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });
  const password = useWatch({ control: form.control, name: "password" });

  const submit = (values: RegisterValues) => {
    form.clearErrors("root");
    signUp.mutate(
      { name: values.name, email: values.email, phone: values.phone, password: values.password },
      {
        onError: (error) => {
          if (!applyServerErrors(error, form.setError, ["name", "email", "phone", "password"])) {
            form.setError("root", { message: error.message });
          }
        },
      }
    );
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <FieldGroup>
        <TextField control={form.control} name="name" label="Full name" autoComplete="name" placeholder="Karim Uddin" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <TextField
            control={form.control}
            name="phone"
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+8801712345678"
          />
        </div>
        <div className="space-y-2">
          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            autoComplete="new-password"
            description="At least 8 characters with a letter and a number."
          />
          <PasswordStrength value={password} />
        </div>
        <PasswordField control={form.control} name="confirmPassword" label="Confirm password" autoComplete="new-password" />
      </FieldGroup>
      {form.formState.errors.root && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={signUp.isPending || signUp.isSuccess}>
        {signUp.isPending ? <Spinner /> : <UserPlus data-icon="inline-start" />}
        Create account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        New accounts are citizen accounts. Staff and admin accounts are created by the city admin.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
