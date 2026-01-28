// src/components/error/form-error-handler.tsx
import { useFormContext } from "react-hook-form";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

/**
 * Form Error Handler Component
 *
 * Displays form-level errors in agricultural context
 * Works with react-hook-form error state
 */
export function FormErrorHandler() {
  const { formState } = useFormContext();

  if (!formState.errors || Object.keys(formState.errors).length === 0) {
    return null;
  }

  // Get root/form-level error if exists
  const rootError = formState.errors.root?.message;

  if (!rootError) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{rootError as string}</AlertDescription>
    </Alert>
  );
}
