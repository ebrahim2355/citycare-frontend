import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your CityCare account.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading title="Choose a new password" description="Pick a password you do not use anywhere else" />
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
