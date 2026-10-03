// apps/frontend/src/features/formulas/components/formula-create-form.tsx
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
import { CreateFormulaDto, ProductoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface FormProps {
  onSubmit: (data: CreateFormulaDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateFormulaDto>;
  productos: ProductoDto[];
  totalPorcentaje: number;
}

function ProductoSlot({
  form,
  index,
  productos,
  label,
}: {
  form: UseFormReturn<CreateFormulaDto>;
  index: 1 | 2 | 3 | 4;
  productos: ProductoDto[];
  label: string;
}) {
  const productoField = `producto${index}Id` as const;
  const porcentajeField = `porcentaje${index}` as const;
  const isRequired = index === 1;

  return (
    <div className="grid grid-cols-[1fr_80px] gap-2 items-end">
      <FormField
        control={form.control}
        name={productoField}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
              {label} {isRequired && "*"}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[250px] md:max-h-[300px]">
                {productos.map((s) => (
                  <SelectItem key={s.id} value={s.id} disabled={!s.isActive}>
                    {s.isActive ? (
                      s.nombre
                    ) : (
                      <>
                        <span className="text-muted-foreground line-through">{s.nombre}</span>
                        <span className="ml-2 font-bold uppercase text-muted-foreground/70">
                          Eliminado
                        </span>
                      </>
                    )}
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
            <FormLabel className="text-[10px] text-xs font-bold uppercase tracking-wider text-foreground">
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
                disabled={!form.watch(productoField)}
                placeholder="0"
                className="h-9 rounded-md px-4 text-center font-mono"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function FormulaCreateForm({
  form,
  onSubmit,
  formId,
  productos,
  totalPorcentaje,
}: FormProps) {
  const isValid = totalPorcentaje === 100;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4"
      >
        <div className="space-y-2">
          <ProductoSlot form={form} index={1} productos={productos} label="Producto 1" />
          <ProductoSlot form={form} index={2} productos={productos} label="Producto 2" />
          <ProductoSlot form={form} index={3} productos={productos} label="Producto 3" />
          <ProductoSlot form={form} index={4} productos={productos} label="Producto 4" />
        </div>

        {/* Real-time calculator */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/40 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <Badge
              variant="outline"
              className={
                isValid
                  ? "text-success border-success/20 bg-success/10 font-bold px-2 py-0.5 h-5 h-6 text-[10px] text-xs"
                  : "text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 py-0.5 h-5 h-6 text-[10px] text-xs"
              }
            >
              {isValid ? (
                <CheckCircle className="h-2.5 w-2.5 h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-2.5 w-2.5 h-3 w-3 mr-1" />
              )}
              {totalPorcentaje}%
            </Badge>
          </div>
          <FormDescription className="text-[9px] text-[11px] font-medium leading-tight mt-1">
            Los porcentajes deben sumar 100% para poder crear la fórmula.
          </FormDescription>
        </div>
      </form>
    </Form>
  );
}
