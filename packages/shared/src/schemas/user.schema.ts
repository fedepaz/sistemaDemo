// shared/src/schemas/user.schema.ts

import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string().min(1, { message: "Nombre de usuario es obligatorio" }),
  email: z.string().email().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  passwordHash: z.string().optional(),
  isActive: z.boolean(),
  tenantName: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfileDto = z.infer<typeof UserProfileSchema>;

export const UpdateUserProfileSchema = z.object({
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
  // NOTA: passwordHash está deliberadamente excluido de la actualización de
  // perfil. Las contraseñas solo se cambian vía /auth/password
  // (ChangePasswordSchema, aplica la política de 6-20 + complejidad) o se
  // restauran por un admin vía /auth/restore. Permitir passwordHash aquí
  // escribiría la contraseña en texto plano directamente en la columna.
});

export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;
