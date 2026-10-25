/* CACHÉ DE CONSULTAS */

import { useState } from "react";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ApiError } from "../services/httpClient/ApiError";

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000,
        retry: (failureCount, error) => failureCount < 2 && error instanceof ApiError
          && (error.tipo === "network" || error.tipo === "timeout"
            || (error.status !== undefined && error.status >= 500)),
      },
      mutations: { retry: false },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
