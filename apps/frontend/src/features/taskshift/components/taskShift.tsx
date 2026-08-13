// src/features/taskshift/components/taskShift.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { CreateTaskShiftDto, CreateTaskShiftSchema } from "@vivero/shared";
import { Loader2, Pencil } from "lucide-react";
import { getLocalDateStr } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";
import type { UserProfileDto } from "@vivero/shared";
import { useCreateTaskShift } from "../hooks/useTaskShift";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

function toDateTimeString(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

interface TaskShiftProps {
  entityId: string;
  partidaId: number;
  anio: number;
  indice: number;
  onSuccess?: () => void;
}

export function TaskShift({ entityId, partidaId, anio, indice, onSuccess }: TaskShiftProps) {
  const today = getLocalDateStr(new Date());

  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<UserProfileDto[]>(
    [],
  );

  const isStartComplete = startHour !== "" && startMinute !== "";
  const isEndComplete = endHour !== "" && endMinute !== "";

  const startTime = isStartComplete
    ? toDateTimeString(today, `${startHour}:${startMinute}`)
    : "";
  const endTime = isEndComplete
    ? toDateTimeString(today, `${endHour}:${endMinute}`)
    : "";

  const formTaskShift = useForm<CreateTaskShiftDto>({
    resolver: zodResolver(CreateTaskShiftSchema),
    mode: "onChange",
  });
  useEffect(() => {
    if (isStartComplete) {
      formTaskShift.setValue("startTime", startTime, { shouldDirty: true });
    }
  }, [isStartComplete, startTime, formTaskShift]);

  useEffect(() => {
    if (isEndComplete) {
      formTaskShift.setValue("endTime", endTime, { shouldDirty: true });
    }
  }, [isEndComplete, endTime, formTaskShift]);

  const { mutateAsync: createTaskShift } = useCreateTaskShift();

  useEffect(() => {
    formTaskShift.setValue(
      "employeeUserIds",
      selectedEmployees.map((e) => e.id),
      { shouldValidate: true, shouldDirty: true },
    );
  }, [selectedEmployees, formTaskShift]);

  useEffect(() => {
    formTaskShift.setValue("entityId", entityId, { shouldValidate: true, shouldDirty: true });
  }, [entityId, formTaskShift]);

  useEffect(() => {
    formTaskShift.setValue("partidaId", partidaId, { shouldValidate: true, shouldDirty: true });
  }, [partidaId, formTaskShift]);

  useEffect(() => {
    formTaskShift.setValue("anio", anio, { shouldValidate: true, shouldDirty: true });
  }, [anio, formTaskShift]);

  useEffect(() => {
    formTaskShift.setValue("indice", indice, { shouldValidate: true, shouldDirty: true });
  }, [indice, formTaskShift]);

  return (
    <Form {...formTaskShift}>
      <form
        id="task-shift-form"
        onSubmit={formTaskShift.handleSubmit(async (data) => {
          await createTaskShift(data);
          onSuccess?.();
        })}
        className="flex flex-col gap-1 md:gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        <div className="flex flex-col gap-3 md:gap-4 font-serif">
          <h1 className="font-sans text-sm md:text-sm font-black uppercase tracking-widest text-foreground opacity-80">
            Tiempo de tarea
          </h1>
          <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
            Selecciona el horario de la tarea para hoy ({today}).
          </p>

          {/* Start Time */}
          <div className="flex flex-col gap-3 md:gap-4">
            <FormField
              control={formTaskShift.control}
              name="startTime"
              render={() => (
                <div className="grid grid-cols-2 gap-2">
                  <FormItem className="space-y-1 md:space-y-2">
                    <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                      Inicio
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        <Select onValueChange={setStartHour} value={startHour}>
                          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                            position="popper"
                          >
                            {HOURS.map((h) => (
                              <SelectItem key={`sh-${h}`} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={startMinute}
                          onValueChange={setStartMinute}
                        >
                          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                            position="popper"
                          >
                            {MINUTES.map((m) => (
                              <SelectItem key={`sm-${m}`} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold font-sans text-xs md:text-sm leading-tight md:leading-relaxed opacity-70" />
                  </FormItem>
                </div>
              )}
            />

            {/* End Time */}
            <FormField
              control={formTaskShift.control}
              name="endTime"
              render={() => (
                <div className="grid grid-cols-2 gap-2">
                  <FormItem className="space-y-1 md:space-y-2">
                    <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                      Fin
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        <Select
                          disabled={!isStartComplete}
                          onValueChange={setEndHour}
                          value={endHour}
                        >
                          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                            position="popper"
                          >
                            {HOURS.map((h) => (
                              <SelectItem key={`eh-${h}`} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          disabled={!isStartComplete}
                          onValueChange={setEndMinute}
                          value={endMinute}
                        >
                          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                            position="popper"
                          >
                            {MINUTES.map((m) => (
                              <SelectItem key={`em-${m}`} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold font-sans text-xs md:text-sm leading-tight md:leading-relaxed opacity-70" />
                  </FormItem>
                </div>
              )}
            />
          </div>

          {/* Employee Search */}
          <FormField
            control={formTaskShift.control}
            name="employeeUserIds"
            render={() => (
              <FormItem className="space-y-1 md:space-y-2">
                <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                  Empleados
                </FormLabel>
                <div className="relative">
                  <div className="pl-12 md:pl-14">
                    <EmployeeSearch
                      selectedEmployees={selectedEmployees}
                      onSelect={(emp) =>
                        setSelectedEmployees((prev) => [...prev, emp])
                      }
                      onRemove={(emp) =>
                        setSelectedEmployees((prev) =>
                          prev.filter((e) => e.id !== emp.id),
                        )
                      }
                    />
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>
          {/* Submit Button */}
          <div className="shrink-0 pt-2">
            <Button
              type="submit"
              form="task-shift-form"
              disabled={formTaskShift.formState.isSubmitting}
              className="w-full h-9 text-sm"
            >
              {formTaskShift.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Registrar Tiempo
                </>
              )}
            </Button>
          </div>
      </form>
    </Form>
  );
}
