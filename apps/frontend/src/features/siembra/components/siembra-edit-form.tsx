// src/features/siembra/components/siembra-edit-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Package,
  Activity,
  FileText,
  Warehouse,
  Wrench,
  Calendar,
  Gauge,
  Ruler,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  AsignarUbiSiembraCompletaDto,
  SiembraDto,
  UserProfileDto,
} from "@vivero/shared";

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
import { useDepositos } from "@/features/extendidos";
import { TaskShift } from "@/features/taskshift/components/taskShift";

import { TratamientoSearch } from "./tratamientoSearch";

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

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<UserProfileDto[]>(
    [],
  );

  const metodoMaquina = useWatch({
    name: "metodoMaquina",
    control: form.control,
  });

  const tratamientoSemilla = useWatch({
    name: "tratamientoSemilla",
    control: form.control,
  });

  useEffect(() => {
    form.setValue("startTime", startTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [startTime, form]);

  useEffect(() => {
    form.setValue("endTime", endTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [endTime, form]);

  useEffect(() => {
    form.setValue(
      "employeeUserIds",
      selectedEmployees.map((e) => e.id),
      { shouldValidate: true, shouldDirty: true },
    );
  }, [selectedEmployees, form]);

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
            {/* CANTIDAD DE BANDEJAS — Toggle Read-Only / Edit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Bandejas Confirmadas
                </p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild></TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="border border-border shadow-md"
                >
                  <p>Modificar cantidad de bandejas</p>
                </TooltipContent>
              </Tooltip>
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

          {/* DATOS DE SIEMBRA */}
          <div className="space-y-3 md:space-y-4 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* PRESIÓN DE SEMILLA */}
              <FormField
                control={form.control}
                name="presionSemilla"
                render={({ field }) => (
                  <FormItem className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                        <Gauge className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                        Presión de Semilla
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="40"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            field.onChange(0);
                            return;
                          }
                          if (/^\d+$/.test(raw)) {
                            field.onChange(Number(raw));
                          }
                        }}
                        className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                      />
                    </FormControl>
                    <FormDescription className="text-[9px] md:text-[10px] text-muted-foreground">
                      Solo números enteros - Por ej: 40
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PROFUNDIDAD DE SEMILLA */}
              <FormField
                control={form.control}
                name="profundidadSemilla"
                render={({ field }) => (
                  <FormItem className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                        <Ruler className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                        Profundidad de Semilla
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="1.525"
                        {...field}
                        className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                      />
                    </FormControl>
                    <FormDescription className="text-[9px] md:text-[10px] text-muted-foreground">
                      Valor en cm - Por ej: 1.3, 1.525, 2
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1  gap-4 md:gap-6">
              {/* TRATAMIENTO DE SEMILLA */}
              <TratamientoSearch
                value={tratamientoSemilla ?? ""}
                onChange={(codigo) =>
                  form.setValue("tratamientoSemilla", codigo)
                }
              />
              {/*
               MEZCLA — hidden until client enables mezcla feature 
              <MezclaSelector form={form} />
              */}
            </div>

            <div className="space-y-2 md:space-y-3">
              {/* MÉTODO DE SIEMBRA — Máquina / Manual */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <Wrench className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                    Método
                  </p>
                  <span
                    className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors ${
                      metodoMaquina
                        ? "text-primary border-primary/20 bg-primary/10"
                        : "text-muted-foreground border-border/40 bg-muted/50"
                    }`}
                  >
                    {metodoMaquina ? "Máquina" : "Manual"}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch
                      checked={metodoMaquina}
                      onCheckedChange={(checked) =>
                        form.setValue("metodoMaquina", checked)
                      }
                      className="transition-colors border-primary/80 bg-primary/40"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="border border-border shadow-md"
                  >
                    <p>
                      {metodoMaquina ? "Siembra manual" : "Siembra mecánica"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between py-1">
                <span
                  className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors ${
                    metodoMaquina
                      ? "text-primary border-primary/20 bg-primary/10"
                      : "text-muted-foreground border-border/40 bg-muted/50"
                  }`}
                >
                  {metodoMaquina
                    ? "Mecánica (por defecto)"
                    : "Manual — presione para cambiar a máquina"}
                </span>
              </div>
            </div>
          </div>

          {/* TASK SHIFT */}
          <TaskShift
            startTime={startTime}
            endTime={endTime}
            employees={selectedEmployees}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onEmployeesChange={setSelectedEmployees}
          />

          {/* OBSERVACIONES */}
          <FormField
            control={form.control}
            name="detalleExtendido"
            render={({ field }) => (
              <FormItem className="space-y-2 md:space-y-3">
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
                    className="min-h-[60px] md:min-h-[120px] rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base p-4 leading-relaxed focus:ring-primary/20"
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
