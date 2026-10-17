import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CityCare to report problems, follow your reports and manage city work.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <>
      <AuthHeading title="Welcome back" description="Sign in to your CityCare account" />
      <Suspense fallback={<Skeleton className="h-140 rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
