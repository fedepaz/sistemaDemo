// src/features/taskshift/components/taskShift.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateTaskShift } from "../hooks/useTaskShift";
import { CreateTaskShiftDto, CreateTaskShiftSchema } from "@vivero/shared";
import { usePermission } from "@/hooks/usePermission";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

interface TaskShiftProps {
  entityId: string;
}

function toDateTimeString(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

export function TaskShift({ entityId }: TaskShiftProps) {
  const dataTablePermissions = usePermission("users");
  const { mutateAsync: createTaskShift, isPending: isCreatingTaskShift } =
    useCreateTaskShift();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<CreateTaskShiftDto>({
    resolver: zodResolver(CreateTaskShiftSchema),
    defaultValues: {
      entityId,
      startTime: "",
      endTime: "",
      employeeUserIds: [],
    },
    mode: "onChange",
  });

  async function onSubmit(values: CreateTaskShiftDto) {
    await createTaskShift({ ...values, entityId });
  }

  if (!dataTablePermissions.canRead) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4 font-serif">
      {/* Title */}
      <h1 className="font-sans text-sm md:text-sm font-black uppercase tracking-widest text-foreground opacity-80">
        Tiempo de tarea
      </h1>
      <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
        Selecciona el horario de la tarea para hoy ({today}).
      </p>

      <Form {...form}>
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Start Time */}
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="space-y-1 md:space-y-2">
                  <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                    Inicio
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <Select
                        disabled={isCreatingTaskShift}
                        value={
                          field.value
                            ? field.value.split("T")[1]?.slice(0, 5)
                            : ""
                        }
                        onValueChange={(time) => {
                          field.onChange(toDateTimeString(today, time));
                        }}
                      >
                        <SelectTrigger className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base">
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) =>
                            MINUTES.map((minute) => (
                              <SelectItem
                                key={`${hour}:${minute}`}
                                value={`${hour}:${minute}`}
                              >
                                {hour}:{minute}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time */}
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="space-y-1 md:space-y-2">
                  <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                    Fin
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <Select
                        disabled={isCreatingTaskShift}
                        value={
                          field.value
                            ? field.value.split("T")[1]?.slice(0, 5)
                            : ""
                        }
                        onValueChange={(time) => {
                          field.onChange(toDateTimeString(today, time));
                        }}
                      >
                        <SelectTrigger className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base">
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) =>
                            MINUTES.map((minute) => (
                              <SelectItem
                                key={`${hour}:${minute}`}
                                value={`${hour}:${minute}`}
                              >
                                {hour}:{minute}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Employee User IDs */}
          <FormField
            control={form.control}
            name="employeeUserIds"
            render={({ field }) => (
              <FormItem className="space-y-1 md:space-y-2">
                <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                  Empleados
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <input
                      type="text"
                      placeholder="IDs separados por coma"
                      disabled={isCreatingTaskShift}
                      className="flex h-10 md:h-12 w-full rounded-md border border-input bg-background pl-12 md:pl-14 pr-3 py-2 text-sm md:text-base font-sans ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value?.join(", ") ?? ""}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean);
                        field.onChange(values);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
                  IDs de los empleados asignados, separados por coma.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
