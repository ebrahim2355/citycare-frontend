"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSetSession } from "@/hooks/use-session";
import { authApi } from "@/lib/api/client";
import type { User } from "@/types";

interface SignInResult {
  user: User;
  redirectTo: string;
}

export function useSignIn(action: "login" | "register" = "login") {
  const router = useRouter();
  const setSession = useSetSession();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await authApi.post<SignInResult>(action, body)).data,
    onSuccess: ({ user, redirectTo }) => {
      setSession(user);
      toast.success(action === "register" ? `Welcome to CityCare, ${user.name.split(" ")[0]}` : `Welcome back, ${user.name.split(" ")[0]}`);
      router.replace(redirectTo);
      router.refresh();
    },
  });
}
