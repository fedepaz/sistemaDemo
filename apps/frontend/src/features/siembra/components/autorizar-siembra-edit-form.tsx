// src/features/siembra/components/autorizar-siembra-edit-form.tsx
"use client";

import { Package, Leaf } from "lucide-react";
import { AutorizarSiembraDto, SiembraDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";

interface AutorizarSiembraEditFormProps {
  onSubmit: (data: AutorizarSiembraDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AutorizarSiembraDto>;
  selectedSiembra: SiembraDto;
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-xs md:text-sm font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

export function AutorizarSiembraEditForm({
  form,
  onSubmit,
  selectedSiembra,
}: AutorizarSiembraEditFormProps) {
  const loteLabel =
    selectedSiembra.lote !== null || selectedSiembra.anoLote !== null
      ? `${selectedSiembra.anoLote} / ${selectedSiembra.lote}`
      : "Sin Lote Asignado";
  return (
    <Form {...form}>
      <form
        id="autorizar-siembra-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* Hidden required fields for form validity */}
        <FormField
          control={form.control}
          name="partidaId"
          render={() => <input type="hidden" {...form.register("partidaId")} />}
        />
        <FormField
          control={form.control}
          name="anio"
          render={() => <input type="hidden" {...form.register("anio")} />}
        />
        <FormField
          control={form.control}
          name="indice"
          render={() => <input type="hidden" {...form.register("indice")} />}
        />

        {/* PRODUCT HEADER */}
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

        {/* DETALLE PARTIDA */}
        <div className="space-y-2 md:space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
              Detalle Partida
            </p>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/40 p-3 md:p-4 space-y-0">
            <InfoRow label="Contenedores" value={selectedSiembra.nrocont} />
            <InfoRow label="Propiedad" value={selectedSiembra.propiedad} />
            <InfoRow label="Sem / Gr" value={selectedSiembra.semxgr} />
            <InfoRow label="Año / Lote" value={loteLabel} />
            <InfoRow label="Item" value={selectedSiembra.item} />
            <InfoRow label="C" value={selectedSiembra.c} />
            <InfoRow label="G" value={selectedSiembra.g} />
            <InfoRow
              label="Siembra Sugerida"
              value={selectedSiembra.fechaSugeridaSiembra}
            />
            <InfoRow label="Sem Siembra" value={selectedSiembra.sem_siembra} />
          </div>
        </div>
      </form>
    </Form>
  );
}
