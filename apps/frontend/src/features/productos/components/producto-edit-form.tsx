// apps/frontend/src/features/productos/components/producto-edit-form.tsx
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
import { UpdateProductoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  onSubmit: (data: UpdateProductoDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<UpdateProductoDto>;
}

export function ProductoEditForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: Producto Premium"
                  autoFocus
                  required
                />
              </FormControl>
              <FormDescription className="text-xs font-medium leading-tight">
                Nombre descriptivo del producto. Ej: &quot;Producto Turba&quot;.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
