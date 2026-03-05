// src/providers/app-providers.tsx
"use client";

import { ErrorBoundary } from "@/components/error/error-boundary";
import { ReactClientProvider } from "./query-client-provider";
import { ThemeProvider } from "./theme-provider";
import { ErrorProvider } from "./error-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <TooltipProvider delayDuration={200}>
          <ReactClientProvider>
            <ThemeProvider>
              {children}
              <Toaster richColors position="top-center" closeButton />
            </ThemeProvider>
          </ReactClientProvider>
        </TooltipProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
