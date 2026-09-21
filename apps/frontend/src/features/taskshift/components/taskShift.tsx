// src/features/taskshift/components/taskShift.tsx

"use client";



import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getLocalDateStr, utcToLocalTime } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";
import type { UserProfileDto } from "@vivero/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, User2, Play, Square } from "lucide-react";



function toDateTimeString(date: string, time: string): string {
  const localDate = new Date(`${date}T${time}:00`);
  const offset = -localDate.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${date}T${time}:00.000${sign}${hours}:${minutes}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function extractTimeParts(isoString: string): { hour: string; minute: string } {
  const localTime = utcToLocalTime(isoString);
  const [hour, minute] = localTime.split(":");
  return { hour, minute };
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

  return (
    <div className="space-y-2 shrink-0">


      {/* Time Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
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

        {/* Time Selects (visible after Finalizar) */}
        {hasStarted && hasEnded && (
          <div className="space-y-2">
            {/* Inicio */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground w-12">Inicio</span>
              <div className="flex items-center gap-1">
                <Select
                  value={extractTimeParts(startTime).hour}
                  onValueChange={(val) => {
                    const { minute } = extractTimeParts(startTime);
                    onStartTimeChange(toDateTimeString(today, `${val}:${minute}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] md:max-h-[300px]">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs font-bold">:</span>
                <Select
                  value={extractTimeParts(startTime).minute}
                  onValueChange={(val) => {
                    const { hour } = extractTimeParts(startTime);
                    onStartTimeChange(toDateTimeString(today, `${hour}:${val}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] md:max-h-[300px]">
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fin */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground w-12">Fin</span>
              <div className="flex items-center gap-1">
                <Select
                  value={extractTimeParts(endTime).hour}
                  onValueChange={(val) => {
                    const { minute } = extractTimeParts(endTime);
                    onEndTimeChange(toDateTimeString(today, `${val}:${minute}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] md:max-h-[300px]">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs font-bold">:</span>
                <Select
                  value={extractTimeParts(endTime).minute}
                  onValueChange={(val) => {
                    const { hour } = extractTimeParts(endTime);
                    onEndTimeChange(toDateTimeString(today, `${hour}:${val}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] md:max-h-[300px]">
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            Finalizar
          </Button>
        )}


      </div>

      {/* Employee Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
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
