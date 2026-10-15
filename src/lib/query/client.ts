import { isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/errors";

interface ClientHooks {
  onUnauthorized?: () => void;
  onError?: (error: unknown) => void;
}

const shouldRetry = (failureCount: number, error: unknown) => {
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }

  return failureCount < 2;
};

export const makeQueryClient = (hooks: ClientHooks = {}) => {
  const handleError = (error: unknown) => {
    if (isApiError(error) && error.status === 401) {
      hooks.onUnauthorized?.();
    }
  };

  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        handleError(error);

        if (query.state.data !== undefined) {
          hooks.onError?.(error);
        }
      },
    }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        networkMode: "always",
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        networkMode: "always",
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => query.state.status === "success",
      },
    },
  });
};

let browserClient: QueryClient | undefined;

export const getQueryClient = (hooks?: ClientHooks) => {
  if (isServer) {
    return makeQueryClient();
  }

  browserClient ??= makeQueryClient(hooks);

  return browserClient;
};
