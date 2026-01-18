// shared/src/schemas/auth.schema.ts

import { z } from "zod";

export const RegisterAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Minimum password length
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  tenantId: z.string().uuid(), // Assuming tenantId is a UUID
  roleId: z.string().uuid().optional(),
});

export type RegisterAuthDto = z.infer<typeof RegisterAuthSchema>;

export const LoginAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Password will be compared after fetching user
});

export type LoginAuthDto = z.infer<typeof LoginAuthSchema>;

export const AccessTokenSchema = z.object({
  accessToken: z.string(),
});

export type AccessTokenDto = z.infer<typeof AccessTokenSchema>;

// Response types
export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    tenantId: z.string().uuid(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
