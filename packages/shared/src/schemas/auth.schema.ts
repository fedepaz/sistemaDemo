// shared/src/schemas/auth.schema.ts

import { z } from "zod";
export const RegisterAuthSchema = z.object({
  username: z.string().min(1, { message: "Nombre de usuario es obligatorio" }),
  password: z
    .string()
    .min(4, { message: "Contraseña es obligatoria, mínimo 4 caracteres" })
    .max(12, { message: "Contraseña es obligatoria, máximo 12 caracteres" }),
  firstName: z
    .string()
    .min(1)
    .max(50, { message: "Nombre de usuario máximo 50 caracteres" })
    .optional(),
  lastName: z
    .string()
    .min(1)
    .max(50, { message: "Apellido máximo 50 caracteres" })
    .optional(),
  email: z.string().email({ message: "Email no válido" }).optional(),
  tenantId: z.string().uuid(),
});

export type RegisterAuthDto = z.infer<typeof RegisterAuthSchema>;

export const LoginAuthSchema = z.object({
  username: z.string().min(1, { message: "Nombre de usuario es obligatorio" }),
  password: z
    .string()
    .min(4, { message: "Contraseña es obligatoria, mínimo 4 caracteres" })
    .max(12, { message: "Contraseña es obligatoria, máximo 12 caracteres" }),
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
    id: z.string().uuid(),
    username: z.string().min(1),
    email: z.string().email().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    tenantId: z.string().uuid(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Contraseña es obligatoria" }),
  newPassword: z
    .string()
    .min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres" })
    .max(20, { message: "La nueva contraseña debe tener máximo 20 caracteres" })
    .regex(/[A-Z]/, {
      message: "La nueva contraseña debe contener al menos una letra mayúscula",
    })
    .regex(/[a-z]/, {
      message: "La nueva contraseña debe contener al menos una letra minúscula",
    })
    .regex(/[0-9]/, {
      message: "La nueva contraseña debe contener al menos un número",
    }),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token es obligatorio" }),
  newPassword: ChangePasswordSchema.shape.newPassword,
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
