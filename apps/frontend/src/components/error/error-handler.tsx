// src/components/error/error-handler.tsx
"use client";

import { ApiError } from "@/lib/api/client-fetch";
import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Error Handler Hook
 *
 * Provides consistent error handling across the application
 * following UX principles:
 * - Clear, actionable feedback for field workers
 * - Context-aware error messages
 * - Graceful degradation for offline scenarios
 */
export function useErrorHandler() {
  /**
   * Handle API errors with context
   */
  const handleError = useCallback(
    (
      error: unknown,
      options: {
        context?: string;
        userAction?: string;
        shouldThrow?: boolean;
        silent?: boolean;
      } = {},
    ) => {
      const {
        context,
        userAction,
        shouldThrow = false,
        silent = false,
      } = options;

      // Log error to console in development mode
      if (process.env.NODE_ENV === "development") {
        console.error(`${context || ""} ${userAction || ""}`, error);
      }

      // Don't show for silent errors
      if (silent) {
        if (shouldThrow) throw error;
        return;
      }

      // Parse error details
      const errorDetails = parseError(error);

      // Show user friendly error message
      toast.error({
        title: errorDetails.title,
        message: errorDetails.message,
        variant: errorDetails.variant,
        duration: errorDetails.duration,
      });

      /// Re-throw if needed for parents handlers
      if (shouldThrow) throw error;
    },
    [],
  );

  /**
   * Handle form submission errors with field-level feedback
   */

  const handleFormError = useCallback(
    (
      error: unknown,
      formMethods?: {
        setError: (field: string, error: { message: string }) => void;
      },
    ) => {
      handleError(error, {
        context: "Form submission",
      });

      // Set field-specific errors
      if (formMethods && error instanceof ApiError) {
        Object.entries(error.data).forEach(([field, message]) => {
          formMethods.setError(field, {
            message: message as string,
          });
        });
      }
    },
    [handleError],
  );

  /**
   * Handle optimistic update rollback
   */
  const handleOptimisticError = useCallback(
    (error: unknown, action: string) => {
      handleError(error, {
        context: "Optimistic update",
        userAction: action,
      });

      // Show recovery message
      toast.info({
        title: "Acción revertida",
        message: "La acción fue revertida por un error inesperado.",
        variant: "warning",
        duration: 5000,
      });
    },
    [handleError],
  );

  return {
    handleError,
    handleFormError,
    handleOptimisticError,
  };
}

/**
 * Parse error into user-friendly format
 */
function parseError(error: unknown) {
  let title = "Error";
  let message = "Ha ocurrido un error inesperado";
  let variant: "default" | "destructive" | "warning" = "destructive";
  let duration = 5000;

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        title = "Datos inválidos";
        message =
          error.message || "Por favor, verifica la información ingresada";
        variant = "warning";
        break;
      case 401:
        title = "Sesión expirada";
        message = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
        variant = "destructive";
        duration = 8000;
        break;
      case 403:
        title = "Acceso denegado";
        message =
          error.message || "No tienes permisos para realizar esta acción.";
        variant = "destructive";
        break;
      case 404:
        title = "No encontrado";
        message = error.message || "El recurso solicitado no fue encontrado.";
        variant = "warning";
        break;
      case 409:
        title = "Conflicto";
        message = error.message || "Ya existe un registro con estos datos.";
        variant = "warning";
        break;
      case 500:
        title = "Error del servidor";
        message = "Error interno del servidor. Por favor, intenta nuevamente.";
        variant = "destructive";
        break;
      case 503:
        title = "Servicio no disponible";
        message =
          "El servicio está temporalmente no disponible. Intenta más tarde.";
        variant = "warning";
        duration = 10000;
        break;
      default:
        title = "Error";
        message = error.message || "Ha ocurrido un error inesperado";
        variant = "destructive";
    }
  } else if (error instanceof Error) {
    // Network errors
    if (error.message.includes("Network error")) {
      title = "Sin conexión";
      message =
        "No se puede conectar al servidor. Verifica tu conexión a internet.";
      variant = "warning";
      duration = 10000;
    }
    // Validation errors
    else if (error.message.includes("validation")) {
      title = "Validación fallida";
      message = "Por favor, corrige los errores en el formulario.";
      variant = "warning";
    }
  }

  return { title, message, variant, duration };
}
