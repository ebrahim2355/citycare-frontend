"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSetSession } from "@/hooks/use-session";
import { authApi } from "@/lib/api/client";
import { showOverlay } from "@/stores/overlay-store";
import type { User } from "@/types";

interface SignInResult {
  user: User;
  redirectTo: string;
}

const AREA_NAME = { CITIZEN: "your dashboard", STAFF: "your staff desk", ADMIN: "the city admin desk" } as const;

export function useSignIn(action: "login" | "register" = "login") {
  const router = useRouter();
  const setSession = useSetSession();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await authApi.post<SignInResult>(action, body)).data,
    onSuccess: ({ user, redirectTo }) => {
      showOverlay(action === "register" ? `Welcome to CityCare, ${user.name}` : `Welcome back, ${user.name}`, `Opening ${AREA_NAME[user.role]}`);
      setSession(user);
      toast.success(action === "register" ? "Your account is ready" : "You are signed in");
      router.replace(redirectTo);
      router.refresh();
    },
  });
}
