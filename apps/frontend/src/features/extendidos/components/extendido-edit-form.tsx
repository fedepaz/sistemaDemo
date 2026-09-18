// src/features/extendidos/components/extendido-edit-form.tsx
"use client";

import { Package, FileText, Warehouse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDepositos } from "../hooks/useDepositos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AsignarUbiExtendidoDto, ExtendidoDto } from "@vivero/shared";

import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ExtendidosEditFormProps {
  onSubmit: (data: AsignarUbiExtendidoDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbiExtendidoDto>;
  selectedExtendido: ExtendidoDto;
}

export function ExtendidosEditForm({
  onSubmit,
  form,
  selectedExtendido,
}: ExtendidosEditFormProps) {
  const { data: depositosQuery } = useDepositos();
  const depositos = depositosQuery.filter((d) => d.camara === "");

  const originalStock = selectedExtendido.nrocont;

  return (
    <Form {...form}>
      <form
        id="extendido-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* 🚀 PRODUCT HEADER (Context) */}
        <div className="space-y-3 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Package className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  {selectedExtendido.codigoEspecie}
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                  {selectedExtendido.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 📍 UBICACION SELECTION */}
        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <Warehouse className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                    Depósito de Destino
                  </FormLabel>
                </div>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione depósito" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="rounded-md"
                    position="popper"
                  >
                    {depositos?.map((dep) => (
                      <SelectItem
                        key={dep.codigo}
                        value={dep.codigo.toString()}
                        className="py-1.5 text-sm focus:bg-primary/5 focus:text-primary transition-colors"
                      >
                        {dep.codigo} - {dep.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* 📦 STOCK INICIAL (solo lectura) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Bandejas Recibidas
                </p>
              </div>
              <p className="h-9 rounded-md border border-border/60 bg-muted/50 shadow-sm text-lg md:text-xl font-black px-4 flex items-center text-foreground/80">
                {originalStock}
              </p>
            </div>

            {/* 📉 BAJA (Manual with Advisory) */}
            <FormField
              control={form.control}
              name="baja"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors text-destructive">
                      Baja
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-9 rounded-md shadow-sm text-lg md:text-xl font-bold px-4 transition-all duration-300 border-destructive/20 bg-destructive/5 text-destructive focus-visible:ring-destructive/20"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 📝 OBSERVACIONES (EXTENDIDO) */}
          <FormField
            control={form.control}
            name="extendido"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                    Observaciones
                  </FormLabel>
                </div>
                <FormControl>
                <Textarea
                  placeholder="Notas de ubicación..."
                  className="min-h-[80px] rounded-md p-3"
                  {...field}
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
