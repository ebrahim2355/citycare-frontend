import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/auth-heading";
import { RegisterForm } from "@/components/auth/register-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description: "Create a free CityCare account to report problems in your area and follow them until they are fixed.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <>
      <AuthHeading title="Create your account" description="It is free and takes less than a minute" />
      <RegisterForm />
    </>
  );
}
