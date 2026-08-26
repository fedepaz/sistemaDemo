// shared/src/schemas/cuid.schema.ts
import { z } from "zod";

/**
 * CUID validator for Prisma @default(cuid()) fields.
 * CUIDs are 25-character alphanumeric strings starting with 'c'.
 */
export const cuidSchema = z
  .string()
  .min(1, "ID is required")
  .regex(/^c[a-z0-9]{24,}$/, "Invalid CUID format");

/**
 * Nullable CUID for optional foreign keys.
 */
export const nullableCuidSchema = cuidSchema.nullable();
