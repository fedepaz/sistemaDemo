// src/components/forms/slide-over-form.tsx
"use client";

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
import { UseFormReturn } from "react-hook-form";
import { Eye, Plus, Pencil, Loader2 } from "lucide-react";

type SlideOverMode = "create" | "edit" | "view";

interface SlideOverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
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
}: SlideOverFormProps) {
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-6">
          <div className="space-y-6">{children}</div>
        </ScrollArea>
        <SheetFooter>
          {isViewMode ? (
            <Button onClick={handleCancel} className="w-full" variant="outline">
              {getActionLabel()}
            </Button>
          ) : (
            <div className="flex w-full justify-end gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type={formId ? "submit" : "button"}
                form={formId || undefined} // Only set if provided
                onClick={!formId ? () => onSave?.() : undefined}
                className="w-full"
                disabled={
                  form
                    ? !form.formState.isDirty || form.formState.isSubmitting
                    : false
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
  );
}
