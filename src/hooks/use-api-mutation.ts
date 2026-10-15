"use client";

import { type QueryKey, type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorText } from "@/lib/api/errors";

interface ApiMutationOptions<TData, TVariables, TContext> extends UseMutationOptions<TData, Error, TVariables, TContext> {
  successMessage?: string | ((data: TData, variables: TVariables) => string | null);
  invalidate?: QueryKey[];
  silentError?: boolean;
}

export function useApiMutation<TData = unknown, TVariables = void, TContext = unknown>({
  successMessage,
  invalidate = [],
  silentError = false,
  onSuccess,
  onError,
  onSettled,
  ...options
}: ApiMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, TContext>({
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      const message = typeof successMessage === "function" ? successMessage(data, variables) : successMessage;

      if (message) {
        toast.success(message);
      }

      return onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      if (!silentError) {
        const { title, description } = getErrorText(error);

        toast.error(title, { description });
      }

      return onError?.(error, variables, context, mutation);
    },
    onSettled: async (data, error, variables, context, mutation) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

      return onSettled?.(data, error, variables, context, mutation);
    },
  });
}
