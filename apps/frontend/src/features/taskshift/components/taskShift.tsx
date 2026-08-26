// src/features/taskshift/components/taskShift.tsx

"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLocalDateStr } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";
import type { UserProfileDto } from "@vivero/shared";
import { Clock, User2, AlertTriangle } from "lucide-react";

const ALL_HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const ALL_MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

function toDateTimeString(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

interface TaskShiftProps {
  startTime: string;
  endTime: string;
  employees: UserProfileDto[];
  onStartTimeChange: (startTime: string) => void;
  onEndTimeChange: (endTime: string) => void;
  onEmployeesChange: (employees: UserProfileDto[]) => void;
}

export function TaskShift({
  startTime,
  endTime,
  employees,
  onStartTimeChange,
  onEndTimeChange,
  onEmployeesChange,
}: TaskShiftProps) {
  const today = getLocalDateStr(new Date());

  const [startHour, setStartHour] = useState(
    startTime ? startTime.split("T")[1].split(":")[0] : "",
  );
  const [startMinute, setStartMinute] = useState(
    startTime ? startTime.split("T")[1].split(":")[1] : "",
  );
  const [endHour, setEndHour] = useState(
    endTime ? endTime.split("T")[1].split(":")[0] : "",
  );
  const [endMinute, setEndMinute] = useState(
    endTime ? endTime.split("T")[1].split(":")[1] : "",
  );

  const isStartComplete = startHour !== "" && startMinute !== "";
  const isEndComplete = endHour !== "" && endMinute !== "";

  const validEndHours = useMemo(() => {
    if (!isStartComplete) return ALL_HOURS;
    const sh = parseInt(startHour, 10);
    return ALL_HOURS.filter((h) => parseInt(h, 10) >= sh);
  }, [startHour, isStartComplete]);

  const validEndMinutes = useMemo(() => {
    if (!isStartComplete || endHour === "") return ALL_MINUTES;
    const sh = parseInt(startHour, 10);
    const sm = parseInt(startMinute, 10);
    const eh = parseInt(endHour, 10);
    if (eh > sh) return ALL_MINUTES;
    return ALL_MINUTES.filter((m) => parseInt(m, 10) > sm);
  }, [startHour, startMinute, endHour, isStartComplete]);

  const timeError = useMemo(() => {
    if (!isStartComplete || !isEndComplete) return null;
    const end = new Date(toDateTimeString(today, `${endHour}:${endMinute}`));
    const start = new Date(
      toDateTimeString(today, `${startHour}:${startMinute}`),
    );
    if (end <= start) {
      return "La hora de fin debe ser posterior a la hora de inicio";
    }
    return null;
  }, [
    today,
    startHour,
    startMinute,
    endHour,
    endMinute,
    isStartComplete,
    isEndComplete,
  ]);

  function handleStartHourChange(hour: string) {
    setStartHour(hour);
    if (startMinute) {
      const newStart = toDateTimeString(today, `${hour}:${startMinute}`);
      onStartTimeChange(newStart);

      if (isEndComplete) {
        const newStartD = new Date(newStart);
        const currentEnd = new Date(
          toDateTimeString(today, `${endHour}:${endMinute}`),
        );
        if (currentEnd <= newStartD) {
          setEndHour("");
          setEndMinute("");
          onEndTimeChange("");
        }
      }
    }
  }

  function handleStartMinuteChange(minute: string) {
    setStartMinute(minute);
    if (startHour) {
      const newStart = toDateTimeString(today, `${startHour}:${minute}`);
      onStartTimeChange(newStart);

      if (isEndComplete) {
        const newStartD = new Date(newStart);
        const currentEnd = new Date(
          toDateTimeString(today, `${endHour}:${endMinute}`),
        );
        if (currentEnd <= newStartD) {
          setEndHour("");
          setEndMinute("");
          onEndTimeChange("");
        }
      }
    }
  }

  function handleEndHourChange(hour: string) {
    setEndHour(hour);
    if (endMinute) {
      onEndTimeChange(toDateTimeString(today, `${hour}:${endMinute}`));
    }
  }

  function handleEndMinuteChange(minute: string) {
    setEndMinute(minute);
    if (endHour) {
      onEndTimeChange(toDateTimeString(today, `${endHour}:${minute}`));
    }
  }

  return (
    <div className="space-y-3 md:space-y-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
          <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
        </div>
        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
          Tiempo de tarea
        </h3>
        <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
          Selecciona el horario de la tarea para hoy
          <br />({today}).
        </p>
      </div>

      {/* Start Time */}
      <div className="flex flex-col gap-3 md:gap-4 font-serif">
        <div className="grid gap-2">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                Inicio
              </Label>
            </div>

            <div className="flex gap-1">
              <Select onValueChange={handleStartHourChange} value={startHour}>
                <SelectTrigger className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                  position="popper"
                >
                  {ALL_HOURS.map((h) => (
                    <SelectItem key={`sh-${h}`} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={startMinute}
                onValueChange={handleStartMinuteChange}
              >
                <SelectTrigger className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                  position="popper"
                >
                  {ALL_MINUTES.map((m) => (
                    <SelectItem key={`sm-${m}`} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* End Time */}
        <div className="grid gap-2">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                Fin
              </Label>
            </div>

            <div className="flex gap-1">
              <Select
                disabled={!isStartComplete}
                onValueChange={handleEndHourChange}
                value={endHour}
              >
                <SelectTrigger
                  className={`h-10 md:h-14 rounded-xl shadow-sm text-sm md:text-base font-bold px-4 ${
                    timeError
                      ? "border-destructive bg-destructive/5"
                      : "border-border/60 bg-background"
                  }`}
                >
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                  position="popper"
                >
                  {validEndHours.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Sin horas disponibles
                    </div>
                  ) : (
                    validEndHours.map((h) => (
                      <SelectItem key={`eh-${h}`} value={h}>
                        {h}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select
                disabled={!isStartComplete}
                onValueChange={handleEndMinuteChange}
                value={endMinute}
              >
                <SelectTrigger
                  className={`h-10 md:h-14 rounded-xl shadow-sm text-sm md:text-base font-bold px-4 ${
                    timeError
                      ? "border-destructive bg-destructive/5"
                      : "border-border/60 bg-background"
                  }`}
                >
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
                  position="popper"
                >
                  {validEndMinutes.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Sin minutos disponibles
                    </div>
                  ) : (
                    validEndMinutes.map((m) => (
                      <SelectItem key={`em-${m}`} value={m}>
                        {m}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {timeError && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <span className="text-xs text-destructive">{timeError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Employee Search */}
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
            <User2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          </div>
          <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
            Empleados
          </Label>
        </div>

        <EmployeeSearch
          selectedEmployees={employees}
          onSelect={(emp) => onEmployeesChange([...employees, emp])}
          onRemove={(emp) =>
            onEmployeesChange(employees.filter((e) => e.id !== emp.id))
          }
        />
      </div>
    </div>
  );
}
