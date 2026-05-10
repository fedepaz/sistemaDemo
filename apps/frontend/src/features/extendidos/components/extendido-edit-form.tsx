// src/features/extendidos/components/extendido-edit-form.tsx
"use client";

import {
  Package,
  Activity,
  FileText,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useDepositos } from "../hooks/useDepositos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AsignarUbicacionDto, ExtendidoDto } from "@vivero/shared";

import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ExtendidosEditFormProps {
  onSubmit: (data: AsignarUbicacionDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbicacionDto>;
  selectedExtendido: ExtendidoDto;
}

export function ExtendidosEditForm({
  onSubmit,
  onCancel,
  form,
  selectedExtendido,
}: ExtendidosEditFormProps) {
  const { data: depositos } = useDepositos();

  // Logic to calculate baja automatically: original_stock - new_stock
  const watchedStockIni = form.watch("stock_ini");
  const originalStock = selectedExtendido.con;

  useEffect(() => {
    const newStock = Number(watchedStockIni) || 0;
    const calculatedBaja = Math.max(0, originalStock - newStock);
    form.setValue("baja", calculatedBaja);
  }, [watchedStockIni, originalStock, form]);

  return (
    <Form {...form}>
      <form
        id="extendido-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10"
      >
        {/* 🚀 PRODUCT HEADER (Context) */}
        <div className="space-y-4 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  {selectedExtendido.codigoEspecie}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                  {selectedExtendido.nombreEspecie}
                </p>
              </div>
            </div>
            <div className="text-right pr-2">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-1">
                Bandejas en Cámara
              </p>
              <p className="text-2xl font-black text-primary leading-none">
                {originalStock}
              </p>
            </div>
          </div>
        </div>

        {/* 📍 UBICACION SELECTION */}
        <div className="flex flex-col gap-8">
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Warehouse className="h-4 w-4 text-primary" />
                  </div>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-foreground">
                    Depósito de Destino
                  </FormLabel>
                </div>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-xl border-border/60 bg-background shadow-sm text-base font-bold px-4">
                      <SelectValue placeholder="Seleccione el depósito final" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[300px]"
                    position="popper"
                  >
                    {depositos?.map((dep) => (
                      <SelectItem
                        key={dep.codigo}
                        value={dep.codigo.toString()}
                        className="font-bold py-3 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors"
                      >
                        {dep.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-[10px] font-medium leading-relaxed px-1">
                  Obligatorio: Indique hacia dónde se moverán las bandejas para habilitar el proceso.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-8">
            {/* 📦 STOCK INICIAL */}
            <FormField
              control={form.control}
              name="stock_ini"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-foreground">
                      Bandejas Ok (Para Extender)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-16 rounded-xl border-border/60 bg-background shadow-sm text-3xl font-black px-4"
                    />
                  </FormControl>
                  <FormDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                    Ingrese el número de bandejas en buen estado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 📉 BAJA (Calculated) */}
            <FormField
              control={form.control}
              name="baja"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </div>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-destructive">
                      Baja (Descarte Automático)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        disabled
                        className="h-16 rounded-xl border-destructive/20 bg-destructive/5 shadow-inner text-3xl font-black text-destructive px-4 opacity-100"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="text-[10px] font-black uppercase text-destructive/40 tracking-tighter">Waste</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] font-bold text-destructive/60 uppercase">
                    Calculado: {originalStock} (Total) - {watchedStockIni || 0} (Ok)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 📝 DETALLE */}
          <FormField
            control={form.control}
            name="detalle"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-foreground">
                    Observaciones Operativas
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Detalles sobre el estado de la partida, anomalías o notas de ubicación..."
                    className="min-h-[120px] rounded-xl border-border/60 bg-background shadow-sm text-base p-4 leading-relaxed focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-[9px] italic opacity-60">
                  Esta información se guardará en el detalle técnico de la partida (Historial).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
