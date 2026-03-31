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
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nombre de la entidad"
                  autoFocus
                  required
                  tabIndex={0}
                />
              </FormControl>
              <FormDescription>
                El nombre de la entidad debe ser único y no puede contener
                espacios.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiqueta</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Etiqueta de la entidad"
                  required
                  tabIndex={0}
                />
              </FormControl>
              <FormDescription>
                La etiqueta de la entidad es la que se mostrará en la tabla de
                entidades.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de permiso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger tabIndex={0}>
                    <SelectValue placeholder="Selecciona un tipo de permiso" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CRUD">CRUD (Estándar)</SelectItem>
                  <SelectItem value="READ_ONLY">Solo Lectura</SelectItem>
                  <SelectItem value="PROCESS">Proceso (Ejecución)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                El tipo de permiso determina qué acciones se pueden realizar
                sobre la entidad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
