import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get a link to choose a new CityCare password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading title="Forgot your password?" description="Enter your email and we will send you a reset link" />
      <ForgotPasswordForm />
    </>
  );
}
