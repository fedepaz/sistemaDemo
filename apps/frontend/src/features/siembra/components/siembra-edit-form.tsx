// src/features/siembra/components/siembra-edit-form.tsx
"use client";

import { Package, Activity, Warehouse, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AsignarUbiSiembraCompletaDto,
  SiembraDto,
} from "@vivero/shared";

import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDepositos } from "@/features/extendidos";

interface SiembraEditFormProps {
  onSubmit: (data: AsignarUbiSiembraCompletaDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbiSiembraCompletaDto>;
  selectedSiembra: SiembraDto;
}

export function SiembraEditForm({
  onSubmit,
  form,
  selectedSiembra,
}: SiembraEditFormProps) {
  const { data: depositosQuery } = useDepositos();
  const depositos = depositosQuery.filter((d) => d.camara !== "");

  return (
    <Form {...form}>
      <form
        id="siembra-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* PRODUCT HEADER (Context) */}
        <div className="space-y-3 md:space-y-4 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Package className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  {selectedSiembra.codigoEspecie}
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                  {selectedSiembra.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CAMARA DE DESTINO + FECHA */}
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="cg"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Warehouse className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Cámara de Destino
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                        <SelectValue placeholder="Seleccione cámara" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                      position="popper"
                    >
                      {depositos?.map((dep) => (
                        <SelectItem
                          key={dep.codigo}
                          value={dep.codigo.toString()}
                          className="font-bold py-2 md:py-3 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors text-sm md:text-base"
                        >
                          {dep.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="f_siembra"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Fecha de Siembra
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            {/* CANTIDAD DE BANDEJAS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Bandejas Confirmadas
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="cantidaNroCont"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-12 md:h-16 rounded-xl border-border/60 bg-background shadow-sm text-xl md:text-3xl font-black px-4"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
