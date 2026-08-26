// shared/src/schemas/auth.schema.ts

import { z } from "zod";
import { cuidSchema } from "./cuid.schema";

// Reusable password validation rules
export const passwordRules = z
  .string()
  .min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  })
  .max(20, {
    message: "La contraseña debe tener máximo 20 caracteres",
  })
  .regex(/[A-Z]/, {
    message: "La contraseña debe contener al menos una letra mayúscula",
  })
  .regex(/[a-z]/, {
    message: "La contraseña debe contener al menos una letra minúscula",
  })
  .regex(/[0-9]/, {
    message: "La contraseña debe contener al menos un número",
  });

export const RegisterAuthSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Nombre de usuario es obligatorio" })
    .max(50, { message: "Nombre de usuario máximo 50 caracteres" }),
  firstName: z
    .string()
    .min(1, { message: "Es necesario al menos un nombre" })
    .max(50, { message: "Nombre máximo 50 caracteres" })
    .optional(),
  lastName: z
    .string()
    .min(1, { message: "Es necesario al menos un apellido" })
    .max(50, { message: "Apellido máximo 50 caracteres" })
    .optional(),
  email: z.string().email({ message: "Email no válido" }).optional(),
});

export type RegisterAuthDto = z.infer<typeof RegisterAuthSchema>;

export const LoginAuthSchema = z.object({
  username: z.string().min(1, { message: "Nombre de usuario es obligatorio" }),
  // El login NO debe imponer la política de contraseña (6-20 + complejidad):
  // una validación más estricta bloquearía contraseñas válidas y filtraría
  // las reglas de la política a través de mensajes de error. La política se
  // aplica al momento de crear/cambiar la contraseña (passwordRules).
  password: z
    .string()
    .min(1, { message: "Contraseña es obligatoria" })
    .max(100, { message: "Contraseña demasiado larga" }),
});

export type LoginAuthDto = z.infer<typeof LoginAuthSchema>;

export const AccessTokenSchema = z.object({
  accessToken: z.string(),
});

export type AccessTokenDto = z.infer<typeof AccessTokenSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const Tokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type TokensDto = z.infer<typeof Tokens>;

// Response types
export const AuthResponseSchema = z.object({
  user: z.object({
    id: cuidSchema,
    username: z.string().min(1),
    email: z.string().email().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    tenantId: cuidSchema,
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
  isDefaultPassword: z.boolean(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Contraseña es obligatoria" }),
    newPassword: passwordRules,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña no puede ser la misma que la actual",
    path: ["newPassword"],
  });

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

// Restore Password
export const RestorePasswordSchema = z.object({
  userId: cuidSchema,
});

export type RestorePasswordDto = z.infer<typeof RestorePasswordSchema>;
