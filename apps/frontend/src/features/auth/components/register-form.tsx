// src/features/auth/components/register-form.tsx
"use client";

import { useRegister } from "@/features/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterAuthDto, RegisterAuthSchema } from "@vivero/shared";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, User, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthContext } from "../providers/AuthProvider";

export function RegisterForm() {
  const { mutateAsync: createUser, isPending: isCreatingUser } = useRegister();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { isLoginComplete } = useAuthContext();

  useEffect(() => {
    if (isLoginComplete) {
      router.push("/");
    }
  }, [isLoginComplete, router]);

  const form = useForm<RegisterAuthDto>({
    resolver: zodResolver(RegisterAuthSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: RegisterAuthDto) {
    try {
      await createUser(values);
      setIsSuccess(true);
    } catch {}
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
        <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        <h1 className="font-sans text-sm sm:text-base font-black uppercase tracking-widest text-foreground opacity-90">
          Cuenta creada correctamente
        </h1>
        {/* 
        Debe aguardar a que el encargado la active y asigne los permisos
        */}
        <div className="space-y-2 text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed">
          <p className="font-sans text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed opacity-80">
            Ahora tiene que aguardar a que el encargado la active y asigne los
            permisos
          </p>
        </div>
        <Button
          className="w-full h-11 sm:h-12 bg-primary rounded-lg p-2 cursor-pointer mt-2 gap-2 text-sm sm:text-base font-medium"
          onClick={() => router.push(ROUTES.LOGIN)}
          tabIndex={0}
        >
          Ir a login
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:gap-4"
      >
        {/* Title */}
        <h1 className="font-sans text-sm sm:text-base font-black uppercase tracking-widest text-foreground opacity-80">
          Registrar cuenta
        </h1>
        <p className="font-sans text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed opacity-70">
          Completa los campos para crear tu cuenta.
        </p>
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-2">
              <FormLabel className="font-sans text-xs sm:text-sm uppercase tracking-widest opacity-70">
                Nombre de usuario
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="juanperez007"
                    disabled={isCreatingUser}
                    className="pl-11 sm:pl-14 h-11 sm:h-12 text-sm sm:text-base"
                    autoFocus
                    tabIndex={0}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px] font-bold font-sans text-xs sm:text-sm leading-tight sm:leading-relaxed opacity-70" />
              <FormDescription className="font-sans text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed opacity-70">
                El nombre de usuario debe ser único. Va a ser usado para
                identificarte en el sistema.
                <br className="hidden sm:block" />
                Los caracteres permitidos son: minúsculas, mayúsculas, números y
                guiones.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* First Name Field */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-2">
              <FormLabel className="font-sans text-xs sm:text-sm uppercase tracking-widest opacity-70">
                Nombre
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="Nombre"
                    disabled={isCreatingUser}
                    className="pl-11 sm:pl-14 h-11 sm:h-12 text-sm sm:text-base"
                    tabIndex={0}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px] font-bold font-sans text-xs sm:text-sm leading-tight sm:leading-relaxed opacity-70" />

              <FormDescription className="font-sans text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed opacity-70">
                Admite nombre o nombres hasta 50 caracteres.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Last Name Field */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-2">
              <FormLabel className="font-sans text-xs sm:text-sm uppercase tracking-widest opacity-70">
                Apellido
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="Apellido"
                    disabled={isCreatingUser}
                    className="pl-11 sm:pl-14 h-11 sm:h-12 text-sm sm:text-base"
                    tabIndex={0}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px] font-bold font-sans text-xs sm:text-sm leading-tight sm:leading-relaxed opacity-70" />

              <FormDescription className="font-sans text-xs sm:text-sm font-medium leading-tight sm:leading-relaxed opacity-70">
                Admite apellidos o apellidos hasta 50 caracteres.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 bg-primary rounded-lg p-2 cursor-pointer mt-2 text-sm sm:text-base font-medium"
          disabled={isCreatingUser || !form.formState.isDirty}
          tabIndex={0}
        >
          {isCreatingUser ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>
    </Form>
  );
}
