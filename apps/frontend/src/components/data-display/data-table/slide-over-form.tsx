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
  form: UseFormReturn<any>;
}

export function SlideOverForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  saveLabel,
  formId,
  form,
}: SlideOverFormProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
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
          <div className="flex w-full justify-end gap-4">
            <Button variant="outline" onClick={handleCancel} className="w-full">
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
              {saveLabel || "Guardar cambios"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
