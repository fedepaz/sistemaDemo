// src/features/alerts/components/v1/alert-edit-form.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AlertBaseDto, CreateAlertCommentDto } from "@vivero/shared";
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AlertEditFormProps {
  onSubmit: (data: CreateAlertCommentDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<CreateAlertCommentDto>;
  selectedAlert: AlertBaseDto;
}

export function AlertEditForm({
  onSubmit,
  onCancel: _onCancel,
  form,
  selectedAlert,
}: AlertEditFormProps) {
  return (
    <Form {...form}>
      <form
        id="alert-comment-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* Alert context header */}
        <div className="space-y-3 md:space-y-4 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  #{selectedAlert.partidaId}/{selectedAlert.indice}
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                  Año {selectedAlert.anio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment textarea */}
        <div className="space-y-2 md:space-y-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                    Observaciones
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    className="min-h-[80px] md:min-h-[120px] rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base p-4 leading-relaxed focus:ring-primary/20"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {field.value?.length ?? 0}/500
                  </span>
                </div>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
