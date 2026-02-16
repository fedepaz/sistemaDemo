// src/components/user-profile/user-password.tsx

import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordDto, ChangePasswordSchema } from "@vivero/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

export function ChangePasswordForm() {
  const { changePasswordAsync, isLoading } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
  });

  async function onSubmit(values: ChangePasswordDto) {
    try {
      await changePasswordAsync(values);
    } catch {}
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 font-serif"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Contraseña actual</FormLabel>
              <FormControl>
                <div className="relative">
                  {/* Ícono de candado */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Input con padding ajustado */}
                  <Input
                    placeholder="••••••••"
                    type={showCurrent ? "text" : "password"}
                    {...field}
                    disabled={isLoading}
                    className="pl-9 pr-10" // Espacio para ícono + botón
                  />

                  {/* Botón toggle - SIN tabIndex={-1} para accesibilidad */}
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={
                      showCurrent
                        ? "Ocultar contraseña actual"
                        : "Mostrar contraseña actual"
                    }
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Nueva contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <Input
                    placeholder="••••••••"
                    type={showNew ? "text" : "password"}
                    {...field}
                    disabled={isLoading}
                    className="pl-9 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={
                      showNew
                        ? "Ocultar nueva contraseña"
                        : "Mostrar nueva contraseña"
                    }
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary rounded p-2 cursor-pointer"
          disabled={isLoading || !form.formState.isDirty}
        >
          Actualizar
        </Button>
      </form>
    </Form>
  );
}
