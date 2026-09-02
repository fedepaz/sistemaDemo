// apps/frontend/src/features/mezclas/components/mezcla-create-form.tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateMezclaDto, SustratoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface FormProps {
  onSubmit: (data: CreateMezclaDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateMezclaDto>;
  sustratos: SustratoDto[];
  totalPorcentaje: number;
}

function SustratoSlot({
  form,
  index,
  sustratos,
  label,
}: {
  form: UseFormReturn<CreateMezclaDto>;
  index: 1 | 2 | 3 | 4;
  sustratos: SustratoDto[];
  label: string;
}) {
  const sustratoField = `sustrato${index}Id` as const;
  const porcentajeField = `porcentaje${index}` as const;
  const isRequired = index === 1;

  return (
    <div className="grid grid-cols-[1fr_80px] gap-2 items-end">
      <FormField
        control={form.control}
        name={sustratoField}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
              {label} {isRequired && "*"}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                  <SelectValue placeholder="Seleccionar sustrato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sustratos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={porcentajeField}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
              %
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={100}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? null : Number(val));
                }}
                disabled={!form.watch(sustratoField)}
                placeholder="0"
                className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-mono font-bold px-4 text-center"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function MezclaCreateForm({
  form,
  onSubmit,
  formId,
  sustratos,
  totalPorcentaje,
}: FormProps) {
  const isValid = totalPorcentaje === 100;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        <div className="space-y-3">
          <SustratoSlot form={form} index={1} sustratos={sustratos} label="Sustrato 1" />
          <SustratoSlot form={form} index={2} sustratos={sustratos} label="Sustrato 2" />
          <SustratoSlot form={form} index={3} sustratos={sustratos} label="Sustrato 3" />
          <SustratoSlot form={form} index={4} sustratos={sustratos} label="Sustrato 4" />
        </div>

        {/* Real-time calculator */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/40 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">
              Total
            </span>
            <Badge
              variant="outline"
              className={
                isValid
                  ? "text-success border-success/20 bg-success/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[10px] md:text-xs"
                  : "text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[10px] md:text-xs"
              }
            >
              {isValid ? (
                <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              )}
              {totalPorcentaje}%
            </Badge>
          </div>
          <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight mt-1">
            Los porcentajes deben sumar 100% para poder crear la mezcla.
          </FormDescription>
        </div>
      </form>
    </Form>
  );
}
