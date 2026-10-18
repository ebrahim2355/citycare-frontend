import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Forgot password",
  description: "Get a link to choose a new CityCare password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading title="Forgot your password?" description="Enter your email and we will send you a reset link" />
      <ForgotPasswordForm />
    </>
  );
}
