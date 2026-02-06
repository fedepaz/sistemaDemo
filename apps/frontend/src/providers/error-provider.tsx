// src/providers/error-provider.tsx
"use client";

import { parseApiError, ParsedError } from "@/lib/api/error-handler";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext } from "react";
import { toast } from "sonner";

interface ErrorContextValue {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => void;
  handleFormError: (
    error: unknown,
    setError: (field: string, error: { message: string }) => void,
  ) => void;
  handleOptimisticError: (error: unknown) => void;
}

interface ErrorHandlerOptions {
  context?: string;
  silent?: boolean;
  shouldRedirect?: boolean;
  onRetry?: () => void;
  shouldThrow?: boolean;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  console.log("ErrorProvider initialized");

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      console.log("handleError called: ");
      console.log(error);
      const {
        context,
        silent = false,
        shouldRedirect = true,
        shouldThrow = false,
      } = options;

      if (process.env.NODE_ENV === "development") {
        console.error(`${context || ""}`, error);
      }

      const parsed = parseApiError(error);
      console.log("parsed: ");
      console.log(parsed);

      if (silent) {
        if (shouldThrow) throw error;
        return;
      }
      const toastConfig = getToastConfig(parsed);
      console.log("toastConfig: ");
      console.log(toastConfig);

      if (parsed.type === "AUTH" && parsed.isFatal && shouldRedirect) {
        console.log("AUTH and isFatal and shouldRedirect");

        toast.error(toastConfig.title, {
          description: toastConfig.description,
          duration: 3000,
        });

        setTimeout(() => {
          localStorage.clear();
          router.push("/login");
        }, 2500);

        if (shouldThrow) throw error;
        return;
      }

      console.log("Showing toast");
      console.log(toastConfig);
      toast.error(toastConfig.title, {
        description: toastConfig.description,
        duration: toastConfig.duration,
      });

      if (shouldThrow) throw error;
    },
    [router],
  );

  const handleFormError = useCallback(
    (
      error: unknown,
      setError: (field: string, error: { message: string }) => void,
    ) => {
      handleError(error, { context: "Form Submission" });
      const parsed = parseApiError(error);

      if (setError && parsed.details) {
        Object.entries(parsed.details).forEach(([field, message]) => {
          if (typeof message === "string") {
            setError(field, {
              message,
            });
          }
        });
      }
    },
    [handleError],
  );

  const handleOptimisticError = useCallback(
    (error: unknown) => {
      handleError(error, {
        context: "Optimistic Mutation",
        shouldRedirect: false,
      });

      toast.info("Acción Revertida", {
        description: `La acción que estabas realizando fue revertida.`,
        duration: 3000,
      });
    },
    [handleError],
  );

  return (
    <ErrorContext.Provider
      value={{ handleError, handleFormError, handleOptimisticError }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorHandler must be used within a ErrorProvider");
  }
  return context;
}

function getToastConfig(parsed: ParsedError) {
  const base = {
    title: parsed.title,
    description: parsed.message,
    duration: parsed.shouldRetry ? 8000 : 5000,
  };

  switch (parsed.type) {
    case "NETWORK":
    case "TIMEOUT":
      return { ...base, variant: "warning" as const };
    case "AUTH":
      return { ...base, variant: "destructive" as const, duration: 6000 };
    case "VALIDATION":
    case "CONFLICT":
      return { ...base, variant: "warning" as const };
    default:
      return { ...base, variant: "destructive" as const };
  }
}
