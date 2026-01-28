// src/lib/api/error-handler.ts
import { ApiError } from "./client-fetch";

/**
 * API Error Handler
 *
 * Centralized error parsing and categorization
 * Returns structured error information for UI consumption
 */
export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  shouldRetry?: boolean;
  isFatal?: boolean;
}

export type ErrorType =
  | "NETWORK"
  | "AUTH"
  | "VALIDATION"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export function parseApiError(error: unknown): ParsedError {
  // Network errors
  if (error instanceof TypeError) {
    return {
      type: "NETWORK",
      title: "Sin conexión",
      message:
        "No se puede conectar al servidor. Verifica tu conexión a internet.",
      shouldRetry: true,
    };
  }

  // API errors
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return {
          type: "VALIDATION",
          title: "Datos inválidos",
          message:
            error.message || "Por favor, verifica la información ingresada",
          details: error.details,
        };
      case 401:
        return {
          type: "AUTH",
          title: "Sesión expirada",
          message:
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          isFatal: true,
        };
      case 403:
        return {
          type: "FORBIDDEN",
          title: "Acceso denegado",
          message:
            error.message || "No tienes permisos para realizar esta acción.",
        };
      case 404:
        return {
          type: "NOT_FOUND",
          title: "No encontrado",
          message: error.message || "El recurso solicitado no fue encontrado.",
        };
      case 408:
        return {
          type: "TIMEOUT",
          title: "Tiempo de espera agotado",
          message: "La solicitud tardó demasiado tiempo. Intenta nuevamente.",
          shouldRetry: true,
        };
      case 409:
        return {
          type: "CONFLICT",
          title: "Conflicto",
          message: error.message || "Ya existe un registro con estos datos.",
        };
      case 500:
        return {
          type: "SERVER_ERROR",
          title: "Error del servidor",
          message: "Error interno del servidor. Por favor, intenta nuevamente.",
          shouldRetry: true,
        };
      case 503:
        return {
          type: "SERVER_ERROR",
          title: "Servicio no disponible",
          message:
            "El servicio está temporalmente no disponible. Intenta más tarde.",
          shouldRetry: true,
        };
      default:
        return {
          type: "UNKNOWN",
          title: "Error",
          message: error.message || "Ha ocurrido un error inesperado",
        };
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      type: "UNKNOWN",
      title: "Error",
      message: error.message,
    };
  }

  return {
    type: "UNKNOWN",
    title: "Error desconocido",
    message: "Ha ocurrido un error inesperado",
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.shouldRetry || false;
}

/**
 * Check if error requires authentication
 */
export function requiresAuthentication(error: unknown): boolean {
  if (error instanceof ApiError && error.status === 401) {
    return true;
  }
  return false;
}
