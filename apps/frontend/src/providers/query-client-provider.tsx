// src/providers/query-client-provider.tsx

"use client";

import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { useError } from "./error-provider";

interface Props {
  children: ReactNode;
}

export function ReactClientProvider({ children }: Props) {
  const { handleError } = useError();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 60 * 1000 * 10, // 10 minutes
            retry: 1, // Retry once to account for transient network issues
          },
          mutations: {
            retry: 0, // Disable retries for mutations
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            const context = query.meta?.context || "Petición API";
            handleError(error, {
              context: context as string,
              shouldRedirect: false,
              silent: false,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, variables, context, mutation) => {
            const operation = mutation.meta?.operation || "Mutación API";
            handleError(error, {
              context: operation as string,
              shouldRedirect: false,
              silent: false,
            });
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
