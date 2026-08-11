// src/features/auth/components/register-form.tsx
"use client";

import { useRegister } from "@/features/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterAuthDto, RegisterAuthSchema } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const { mutateAsync: createUser, isPending: isCreatingUser } = useRegister();

  const router = useRouter();

  const form = useForm<RegisterAuthDto>({
    resolver: zodResolver(RegisterAuthSchema),

    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: RegisterAuthDto) {
    try {
      await createUser(values);
    } catch {}
    router.push("/");
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-4 font-serif"
      >
        {/* Title */}
        <h1 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
          Crear nuevo usuario
        </h1>
        <p className="text-[9px] md:text-[10px] font-medium leading-tight md:leading-relaxed">
          Rellena los campos para crear un nuevo usuario.
          <br className="hidden md:block" />
          El usuario se creará con contraseña por defecto: <b>123456</b>.
        </p>
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1 md:space-y-2">
              <FormLabel className="font-sans text-[10px] md:text-sm uppercase tracking-widest opacity-70">
                Nombre de usuario
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="juanperez007"
                    disabled={isCreatingUser}
                    className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base"
                    autoFocus
                    tabIndex={0}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* First Name Field */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="space-y-1 md:space-y-2">
              <FormLabel className="font-sans text-[10px] md:text-sm uppercase tracking-widest opacity-70">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nombre"
                  disabled={isCreatingUser}
                  className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base"
                  autoFocus
                  tabIndex={0}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Last Name Field */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="space-y-1 md:space-y-2">
              <FormLabel className="font-sans text-[10px] md:text-sm uppercase tracking-widest opacity-70">
                Apellido
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Apellido"
                  disabled={isCreatingUser}
                  className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base"
                  autoFocus
                  tabIndex={0}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1 md:space-y-2">
              <FormLabel className="font-sans text-[10px] md:text-sm uppercase tracking-widest opacity-70">
                Correo electrónico
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Correo electrónico"
                  disabled={isCreatingUser}
                  className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base"
                  autoFocus
                  tabIndex={0}
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium italic opacity-60">
                Opcional. Se utiliza para notificaciones del sistema.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 md:h-12 bg-primary rounded p-2 cursor-pointer mt-2"
          disabled={isCreatingUser || !form.formState.isDirty}
          tabIndex={0}
        >
          {isCreatingUser ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Crear usuario"
          )}
        </Button>
      </form>
    </Form>
  );
}
