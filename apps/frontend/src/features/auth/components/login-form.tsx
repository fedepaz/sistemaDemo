// src/features/auth/components/login-form.tsx
"use client";
import { Loader2, Lock, Eye, EyeOff, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useAuthContext } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
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
        className="space-y-4 font-serif"
      >
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Nombre de usuario</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <Input
                    {...field}
                    placeholder="juanperez007"
                    disabled={isLoading}
                    className="pl-14 h-12"
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
            <FormItem>
              <FormLabel className="font-sans">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                    className="pl-14 h-12"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
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
          className="w-full h-12 bg-primary rounded p-2 cursor-pointer"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </Form>
  );
}
