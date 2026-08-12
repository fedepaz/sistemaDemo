// src/features/taskshift/components/taskShift.tsx

"use client";

import { useEffect, useState } from "react";
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

import { CreateTaskShiftDto } from "@vivero/shared";
import { getLocalDateStr } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";
import type { UserProfileDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

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
  onSubmit: (data: CreateTaskShiftDto) => Promise<void>;
  form: UseFormReturn<CreateTaskShiftDto>;
}

export function TaskShift({ onSubmit, form }: TaskShiftProps) {
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

  useEffect(() => {
    if (isStartComplete) {
      form.setValue("startTime", startTime, { shouldDirty: true });
    }
  }, [isStartComplete, startTime, form]);

  useEffect(() => {
    if (isEndComplete) {
      form.setValue("endTime", endTime, { shouldDirty: true });
    }
  }, [isEndComplete, endTime, form]);

  useEffect(() => {
    if (isStartComplete && isEndComplete) {
      const end = new Date(endTime);
      const start = new Date(startTime);
      if (end <= start) {
        form.setError("endTime", {
          type: "manual",
          message: "La hora de fin debe ser posterior a la hora de inicio",
        });
      } else {
        form.clearErrors("endTime");
      }
    }
  }, [startTime, endTime, isStartComplete, isEndComplete, form]);

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
        id="task-shift-form"
        onSubmit={form.handleSubmit(onSubmit)}
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
              control={form.control}
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
              control={form.control}
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
            control={form.control}
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
      </form>
    </Form>
  );
}
