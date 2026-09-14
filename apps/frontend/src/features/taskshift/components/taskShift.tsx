// src/features/taskshift/components/taskShift.tsx

"use client";



import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getLocalDateStr, utcToLocalTime } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";
import type { UserProfileDto } from "@vivero/shared";
import { Clock, User2, Play, Square, RotateCcw } from "lucide-react";



function toDateTimeString(date: string, time: string): string {
  const localDate = new Date(`${date}T${time}:00`);
  const offset = -localDate.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${date}T${time}:00.000${sign}${hours}:${minutes}`;
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

  const hasStarted = startTime !== "";
  const hasEnded = endTime !== "";

  const formattedStart = hasStarted ? utcToLocalTime(startTime) : null;
  const formattedEnd = hasEnded ? utcToLocalTime(endTime) : null;

  function handleStart() {
    const now = new Date();
    const startStr = toDateTimeString(today, `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    onStartTimeChange(startStr);
  }

  function handleStop() {
    const now = new Date();
    const endStr = toDateTimeString(today, `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    onEndTimeChange(endStr);
  }

  function handleReset() {
    onStartTimeChange("");
    onEndTimeChange("");
  }

  return (
    <div className="space-y-3 md:space-y-4 shrink-0">


      {/* Time Control */}
      <div className="space-y-3 md:space-y-4">
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

        {/* Time Display */}
        {(hasStarted || hasEnded) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {formattedStart && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Inicio: <span className="font-bold text-foreground">{formattedStart}</span>
              </span>
            )}
            {formattedEnd && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Fin: <span className="font-bold text-foreground">{formattedEnd}</span>
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        {!hasStarted && (
          <Button
            type="button"
            onClick={handleStart}
            className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar
          </Button>
        )}

        {hasStarted && !hasEnded && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleStop}
            className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
          >
            <Square className="h-4 w-4 mr-2" />
            Detener
          </Button>
        )}

        {hasStarted && hasEnded && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        )}
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
