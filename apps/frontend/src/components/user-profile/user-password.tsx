// src/components/user-profile/user-password.tsx

import { useChangePassword } from "@/features/auth";
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

interface ChangePasswordFormProps {
  onClose: () => void;
}

export function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const { changePasswordAsync, isLoading, reset } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: ChangePasswordDto) {
    try {
      await changePasswordAsync(values);
      setTimeout(() => {
        reset();
        onClose();
      }, 1000);
    } catch {}
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans text-xs sm:text-sm">Contraseña actual</FormLabel>
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
                    className="pl-9 pr-10 h-9 text-sm"
                  />

                  {/* Botón toggle - SIN tabIndex={-1} para accesibilidad */}
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-md cursor-pointer"
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
              <FormLabel className="font-sans text-xs sm:text-sm">Nueva contraseña</FormLabel>
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
                    className="pl-9 pr-10 h-9 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-md cursor-pointer"
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
          className="w-full h-9 bg-primary rounded-md cursor-pointer text-sm font-medium"
          disabled={isLoading || !form.formState.isDirty}
        >
          Actualizar
        </Button>
      </form>
    </Form>
  );
}
