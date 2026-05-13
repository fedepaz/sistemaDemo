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
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Nombre de Usuario</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: juanperez007"
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                  autoFocus
                  tabIndex={0}
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight md:leading-relaxed">
                El nombre de usuario con el que va a ingresar al sistema.
                <br className="hidden md:block" />
                Contraseña por defecto: <b>123456</b>.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 md:space-y-2">
                <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Nombre</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nombre" 
                    className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4"
                    tabIndex={0} 
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 md:space-y-2">
                <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Apellido</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Apellido" 
                    className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4"
                    tabIndex={0} 
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Correo electrónico</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Correo electrónico" 
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4"
                  tabIndex={0} 
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium italic opacity-60">
                Opcional. Se utiliza para notificaciones del sistema.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
