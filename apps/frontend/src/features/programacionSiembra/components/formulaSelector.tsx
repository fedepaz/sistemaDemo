// src/features/programacionSiembra/components/formulaSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker } from "lucide-react";
import { useFormulas } from "@/features/formulas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";

interface FormulaSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  fieldName?: string;
}

export function FormulaSelector({ form, fieldName = "formulaId" }: FormulaSelectorProps) {
  const { data: formulas = [] } = useFormulas();
  const activeFormulas = formulas.filter((f) => f.isActive);

  const getCompositionLabel = (formula: (typeof activeFormulas)[0]) => {
    const parts = [
      formula.producto1Nombre,
      formula.producto2Nombre,
      formula.producto3Nombre,
      formula.producto4Nombre,
    ].filter(Boolean);
    return parts.join(" / ");
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Beaker className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <FormLabel className="text-xs md:text-xs font-black uppercase tracking-widest text-foreground">
              Fórmula
            </FormLabel>
          </div>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                <SelectValue placeholder="Seleccione fórmula" />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="rounded-xl border-border/60 shadow-2xl p-1 max-h-[250px] md:max-h-[300px]"
              position="popper"
            >
              {activeFormulas.map((formula) => (
                <SelectItem
                  key={formula.id}
                  value={formula.id}
                  className="font-bold py-2 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors text-sm md:text-base"
                >
                  {getCompositionLabel(formula)}
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
