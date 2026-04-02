// src/features/users/components/user-create-form.tsx

import { UseFormReturn } from "react-hook-form";

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
import { RegisterAuthDto } from "@vivero/shared";

interface FormProps {
  onSubmit: (data: RegisterAuthDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<RegisterAuthDto>;
}

export function UserCreateForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de Usuario</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: juanperez007"
                  autoFocus
                  tabIndex={0}
                />
              </FormControl>
              <FormDescription>
                El nombre de usuario con el que va a ingresar al sistema.
                <br />
                La contraseña por defecto es <b>123456</b>.
                <br />
                <b>NOTA:</b> En el primer inicio de sesión, se le pedirá que
                ingrese una contraseña nueva.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre" tabIndex={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Apellido" tabIndex={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Correo electrónico" tabIndex={0} />
              </FormControl>
              <FormDescription>
                No es necesario que se registre, sirve para notificaciones del
                sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
