"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/client";
import { queryKeys, sessionQuery } from "@/lib/query/options";
import type { Role, User } from "@/types";

export function useSession() {
  const query = useQuery(sessionQuery());
  const user = query.data ?? null;

  return {
    user,
    isLoading: query.isPending,
    isAuthenticated: Boolean(user),
    hasRole: (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
  };
}

export function useSetSession() {
  const queryClient = useQueryClient();

  return (user: User | null) => queryClient.setQueryData(queryKeys.session, user);
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.post<null>("logout"),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session, null);
      toast.success("You are signed out");
      router.replace("/login");
      router.refresh();
    },
  });
}
