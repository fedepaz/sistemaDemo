// src/features/auth/components/login-form.tsx
"use client";
import { Loader2, Lock, Eye, EyeOff, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useForm } from "react-hook-form";
import { LoginAuthDto, LoginAuthSchema } from "@vivero/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface LoginFormProps {
  onDefaultPassword: () => void;
}

export function LoginForm({ onDefaultPassword }: LoginFormProps) {
  const { loginAsync, isLoading } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginAuthDto>({
    resolver: zodResolver(LoginAuthSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: LoginAuthDto) {
    try {
      const response = await loginAsync(values);
      if (response.isDefaultPassword) {
        onDefaultPassword();
      }
    } catch {}
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 sm:gap-4"
      >
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-2">
              <FormLabel className="font-sans text-xs sm:text-sm uppercase tracking-widest opacity-70">Nombre de usuario</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="juanperez007"
                    disabled={isLoading}
                    className="pl-11 sm:pl-14 h-11 sm:h-12 text-sm sm:text-base"
                    autoFocus
                    tabIndex={0}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-2">
              <FormLabel className="font-sans text-xs sm:text-sm uppercase tracking-widest opacity-70">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    disabled={isLoading}
                    className="pl-11 sm:pl-14 h-11 sm:h-12 text-sm sm:text-base"
                    {...field}
                    tabIndex={0}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 bg-primary rounded-lg p-2 cursor-pointer mt-2 text-sm sm:text-base font-medium"
          disabled={isLoading || !form.formState.isDirty}
          tabIndex={0}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </Form>
  );
}
