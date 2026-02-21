//src/features/plants/components/plants-form.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Plant, PlantFormData, plantSchema } from "../types";

interface PlantFormProps {
  initialData?: Plant;
  onSubmit: (data: PlantFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PlantForm({ initialData, onSubmit }: PlantFormProps) {
  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
    defaultValues: initialData
      ? initialData
      : {
          name: "",
          species: "",
          location: "",
          status: "healthy",
          growthStage: "",
          plantedDate: new Date().toISOString().split("T")[0],
          lastWatered: new Date().toISOString().split("T")[0],
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre de la entidad" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo / Categoría</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Equipo, Proceso, Activo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Sede Central, Almacén A" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Activo, En mantenimiento" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="growthStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etapa / Fase</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Inicial, En curso, Finalizado"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plantedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de registro</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Fecha de registro" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastWatered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Última actualización</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Fecha de la última actualización" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
