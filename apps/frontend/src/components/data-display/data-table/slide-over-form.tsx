// src/components/forms/slide-over-form.tsx
"use client";

import { useState } from "react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UseFormReturn } from "react-hook-form";
import { Eye, Plus, Pencil, Loader2, HelpCircle, AlertTriangle } from "lucide-react";
import { formatShortDate } from "@/lib/date-utils";

type SlideOverMode = "create" | "edit" | "view";

export type ConfirmConfig = {
  title: string;
  description: string;
  label?: string;
  summaryFields: string[];
};

interface SlideOverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  isLoading?: boolean;
  formId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any>;
  mode?: SlideOverMode;
  disabled?: boolean;
  confirm?: ConfirmConfig;
  fieldLabels?: Record<string, string>;
}

export function SlideOverForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  isLoading,
  saveLabel,
  formId,
  form,
  mode = "edit",
  disabled,
  confirm,
  fieldLabels,
}: SlideOverFormProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getActionLabel = () => {
    if (isViewMode) return "Cerrar";
    if (isCreateMode) return saveLabel || "Crear";
    return saveLabel || "Actualizar";
  };

  const getIcon = () => {
    if (isViewMode) return <Eye className="mr-2 h-4 w-4" />;
    if (isCreateMode) return <Plus className="mr-2 h-4 w-4" />;
    return <Pencil className="mr-2 h-4 w-4" />;
  };

  const isSubmitDisabled =
    disabled ||
    (form ? form.formState.isSubmitting : false);

  const getFieldLabel = (field: string) =>
    fieldLabels?.[field] ??
    field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");

  const formatSummaryValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Si" : "No";
    if (value instanceof Date) return formatShortDate(value);
    if (typeof value === "number") return value.toLocaleString("es-AR");
    if (typeof value === "string") {
      if (value.match(/^\d{4}-\d{2}-\d{2}(T|$)/)) return formatShortDate(value);
      return value;
    }
    return String(value);
  };

  const submitForm = () => {
    if (formId) {
      (document.getElementById(formId) as HTMLFormElement)?.requestSubmit();
    } else {
      onSave?.();
    }
  };

  const handleSubmitClick = () => {
    if (form && !form.formState.isValid) {
      form.trigger().then((isValid) => {
        if (!isValid) {
          const errors = Object.entries(form.formState.errors).map(
            ([field, error]) => {
              const label = getFieldLabel(field);
              return `${label}: ${error?.message || "Requerido"}`;
            },
          );
          setValidationErrors(errors);
        }
      });
      return;
    }
    setValidationErrors([]);
    if (confirm) {
      setConfirmOpen(true);
    } else {
      submitForm();
    }
  };

  const handleConfirmSubmit = () => {
    if (form && !form.formState.isValid) {
      form.trigger().then((isValid) => {
        if (!isValid) {
          const errors = Object.entries(form.formState.errors).map(
            ([field, error]) => {
              const label = getFieldLabel(field);
              return `${label}: ${error?.message || "Requerido"}`;
            },
          );
          setValidationErrors(errors);
          setConfirmOpen(false);
        }
      });
      return;
    }
    setValidationErrors([]);
    setConfirmOpen(false);
    submitForm();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col h-dvh p-0">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {description ? (
              <SheetDescription className="text-xs">
                {description}
              </SheetDescription>
            ) : (
              <SheetDescription className="sr-only">
                Formulario para {title}
              </SheetDescription>
            )}
          </SheetHeader>
          {validationErrors.length > 0 && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Corrige los siguientes errores:
                </span>
              </div>
              <ul className="list-disc list-inside text-xs text-destructive/80 space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6 py-4" tabIndex={-1}>
              <div className="space-y-4" tabIndex={-1}>
                {children}
              </div>
            </ScrollArea>
          </div>
          <SheetFooter className="px-6 py-3 border-t shrink-0">
            {isViewMode ? (
              <Button
                onClick={handleCancel}
                className="w-full h-9 text-sm"
                variant="outline"
              >
                {getActionLabel()}
              </Button>
            ) : (
              <div className="flex w-full justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full h-9 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitClick}
                  className="w-full h-9 text-sm"
                  disabled={isSubmitDisabled || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      {isCreateMode ? saveLabel || "Creando" : "Actualizando"}
                    </>
                  ) : (
                    <>
                      {getIcon()}
                      {getActionLabel()}
                    </>
                  )}
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {confirm && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="border-primary/80">
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <AlertDialogTitle className="text-xl">
                  {confirm.title}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-base pt-2">
                {confirm.description}
              </AlertDialogDescription>
              {confirm.summaryFields.length > 0 && (
                <div className="mt-4 rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Resumen:</p>
                  <dl className="space-y-1">
                    {confirm.summaryFields.map((field) => {
                      const values = form?.getValues() ?? {};
                      const value = values[field];
                      return (
                        <div key={field} className="flex justify-between text-sm">
                          <dt className="text-muted-foreground">{getFieldLabel(field)}</dt>
                          <dd className="font-medium text-right">{formatSummaryValue(value)}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isLoading}
                className="min-h-[48px] min-w-[100px]"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSubmit}
                disabled={isLoading}
                className="min-h-[48px] min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  confirm.label || getActionLabel()
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
