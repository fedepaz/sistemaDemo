// apps/frontend/src/features/sustratos/components/sustrato-create-form.tsx
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
import { CreateSustratoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  onSubmit: (data: CreateSustratoDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateSustratoDto>;
}

export function SustratoCreateForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-foreground">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: Sustrato Premium"
                  autoFocus
                  required
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[11px] font-medium leading-tight">
                Nombre descriptivo del sustrato. Ej: &quot;Sustrato Turba&quot;.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
