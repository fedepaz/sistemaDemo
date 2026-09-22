"use client";

import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Activity,
  FileText,
  Gauge,
  Ruler,
  TestTubes,
  Warehouse,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@radix-ui/react-label";
import {
  AsignarUbiSiembraCompletaDto,
  SiembraPartidaDto,
  UserProfileDto,
  PrensadoSustratoValues,
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
import { TaskShift } from "@/features/taskshift/components/taskShift";
import { TratamientoSearch } from "@/features/programacionSiembra/components/tratamientoSearch";
import { useDepositos } from "@/features/extendidos";

import { Textarea } from "@/components/ui/textarea";
import { SustratoSearch } from "@/features/programacionSiembra/components/sustratoSearch";

interface ASembrarEditFormProps {
  onSubmit: (data: AsignarUbiSiembraCompletaDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbiSiembraCompletaDto>;
  selectedPartida: SiembraPartidaDto;
}

export function ASembrarEditForm({
  onSubmit,
  form,
  selectedPartida,
}: ASembrarEditFormProps) {
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

  const sustrato = useWatch({
    name: "sustrato",
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

  const handleSubmit = async (data: AsignarUbiSiembraCompletaDto) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        id="a-sembrar-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* PRODUCT HEADER */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-2.5 rounded-xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Activity className="h-5 w-5 h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base text-lg font-bold tracking-tight leading-none text-foreground uppercase">
                  {selectedPartida.codigoEspecie}
                </h2>
                <p className="text-[9px] text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  {selectedPartida.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* CAMARA DE DESTINO + FECHA */}

        <div className="grid grid-cols-1 grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="cg"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Warehouse className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                  </div>
                  <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                    Cámara de Destino
                  </FormLabel>
                </div>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione cámara" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="rounded-md max-h-[250px] md:max-h-[300px]"
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
          {/* CANTIDAD DE BANDEJAS */}

          <FormField
            control={form.control}
            name="cantidaNroCont"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Activity className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                  </div>
                  <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                    Bandejas Confirmadas
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-9 rounded-md px-4"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* TECHNICAL FIELDS */}
        <div className="space-y-2 shrink-0">
          <div className="grid grid-cols-1 grid-cols-2 gap-2">
            {/* PRESNSADO DE SUSTRATO */}
            <FormField
              control={form.control}
              name="prensadoSustrato"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Gauge className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                      Prensado de Sustrato
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prensado sustrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-md max-h-[250px] md:max-h-[300px]">
                      {PrensadoSustratoValues.map((v) => (
                        <SelectItem
                          key={v}
                          value={String(v)}
                          className="font-medium"
                        >
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[9px] text-[11px] text-muted-foreground">
                    Seleccionar de 0 a 6 (incrementos de 0.5)
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
                <FormItem className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Ruler className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                      Profundidad de Semilla
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="1.525"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[9px] text-[11px] text-muted-foreground">
                    Valor en cm - Por ej: 1.3, 1.525, 2
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* TRATAMIENTO */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TestTubes className="h-3.5 w-3.5 h-4 w-4 text-primary" />
              </div>
              <Label className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                Tratamiento
              </Label>
            </div>
            <TratamientoSearch
              value={tratamientoSemilla ?? ""}
              onChange={(codigo) => form.setValue("tratamientoSemilla", codigo)}
            />
          </div>
          {/* SUSTRATO */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TestTubes className="h-3.5 w-3.5 h-4 w-4 text-primary" />
              </div>
              <Label className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                Sustrato
              </Label>
            </div>
            <SustratoSearch
              value={sustrato ?? ""}
              onChange={(codigo) => form.setValue("sustrato", codigo)}
            />
          </div>

          {/* MÉTODO */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Wrench className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                </div>
                <p className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                  Método
                </p>
                <span
                  className={`text-[9px] text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors ${
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
                  <p>{metodoMaquina ? "Siembra manual" : "Siembra mecánica"}</p>
                </TooltipContent>
              </Tooltip>
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
            <FormItem className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="h-3.5 w-3.5 h-4 w-4 text-primary" />
                </div>
                <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
                  Observaciones
                </FormLabel>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Notas de ubicación..."
                  className="min-h-[60px] rounded-md p-3"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
