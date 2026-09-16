// src/features/siembra/components/mezclaSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker } from "lucide-react";
import { useMezclas } from "@/features/mezclas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";

interface MezclaSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  fieldName?: string;
}

export function MezclaSelector({ form, fieldName = "mezclaId" }: MezclaSelectorProps) {
  const { data: mezclas = [] } = useMezclas();
  const activeMezclas = mezclas.filter((m) => m.isActive);

  const getCompositionLabel = (mezcla: (typeof activeMezclas)[0]) => {
    const parts = [
      mezcla.sustrato1Nombre,
      mezcla.sustrato2Nombre,
      mezcla.sustrato3Nombre,
      mezcla.sustrato4Nombre,
    ].filter(Boolean);
    return parts.join(" / ");
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Beaker className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
              Mezcla
            </FormLabel>
          </div>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                <SelectValue placeholder="Seleccione mezcla" />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
              position="popper"
            >
              {activeMezclas.map((mezcla) => (
                <SelectItem
                  key={mezcla.id}
                  value={mezcla.id}
                  className="font-bold py-2 md:py-3 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors text-sm md:text-base"
                >
                  {getCompositionLabel(mezcla)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
