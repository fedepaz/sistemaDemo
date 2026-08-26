// src/features/taskshift/components/taskShift.tsx

"use client";

import { useState } from "react";
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

  function handleStartHourChange(hour: string) {
    setStartHour(hour);
    if (startMinute) {
      onStartTimeChange(toDateTimeString(today, `${hour}:${startMinute}`));
    }
  }

  function handleStartMinuteChange(minute: string) {
    setStartMinute(minute);
    if (startHour) {
      onStartTimeChange(toDateTimeString(today, `${startHour}:${minute}`));
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
    <div className="flex flex-col gap-3 md:gap-4 font-serif">
      <h1 className="font-sans text-sm md:text-sm font-black uppercase tracking-widest text-foreground opacity-80">
        Tiempo de tarea
      </h1>
      <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
        Selecciona el horario de la tarea para hoy ({today}).
      </p>

      {/* Start Time */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 md:space-y-2">
            <Label className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
              Inicio
            </Label>
            <div className="flex gap-1">
              <Select onValueChange={handleStartHourChange} value={startHour}>
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
                onValueChange={handleStartMinuteChange}
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
          </div>
        </div>

        {/* End Time */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 md:space-y-2">
            <Label className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
              Fin
            </Label>
            <div className="flex gap-1">
              <Select
                disabled={!isStartComplete}
                onValueChange={handleEndHourChange}
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
                onValueChange={handleEndMinuteChange}
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
          </div>
        </div>
      </div>

      {/* Employee Search */}
      <div className="space-y-1 md:space-y-2">
        <Label className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
          Empleados
        </Label>
        <div className="relative">
          <div className="pl-12 md:pl-14">
            <EmployeeSearch
              selectedEmployees={employees}
              onSelect={(emp) => onEmployeesChange([...employees, emp])}
              onRemove={(emp) =>
                onEmployeesChange(employees.filter((e) => e.id !== emp.id))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
