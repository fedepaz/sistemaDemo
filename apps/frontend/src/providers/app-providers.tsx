// src/providers/app-providers.tsx
"use client";

import { ErrorBoundary } from "@/components/error/error-boundary";
import { ReactClientProvider } from "./query-client-provider";
import { ThemeProvider } from "./theme-provider";
import { ErrorProvider } from "./error-provider";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <ReactClientProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </ThemeProvider>
        </ReactClientProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
