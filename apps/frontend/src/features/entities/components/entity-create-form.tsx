// src/features/entities/components/entity-create-form.tsx

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
import { CreateEntityDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  onSubmit: (data: CreateEntityDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateEntityDto>;
}

export function EntityCreateForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Nombre de Tabla</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: users_data"
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4 font-mono"
                  autoFocus
                  required
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight">
                Debe ser único y sin espacios.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Etiqueta Visual</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: Gestión de Usuarios"
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                  required
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight">
                Nombre que verá el usuario final.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissionType"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Tipo de Permiso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/60 shadow-2xl p-1">
                  <SelectItem value="CRUD" className="font-bold">CRUD (Estándar)</SelectItem>
                  <SelectItem value="READ_ONLY" className="font-bold">Solo Lectura</SelectItem>
                  <SelectItem value="PROCESS" className="font-bold">Proceso (Ejecución)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
