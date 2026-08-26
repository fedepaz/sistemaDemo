// shared/src/schemas/cuid.schema.ts
import { z } from "zod";

const CUID_REGEX = /^c[a-z0-9]{24,}$/;

/**
 * CUID validator for Prisma @default(cuid()) fields.
 * CUIDs are 25-character alphanumeric strings starting with 'c'.
 */
export const cuidSchema = z
  .string()
  .min(1, "El ID es requerido")
  .regex(CUID_REGEX, "Formato de ID no válido");

/**
 * Nullable CUID for optional foreign keys.
 */
export const nullableCuidSchema = cuidSchema.nullable();

/**
 * CUID with a friendly Spanish label for required fields.
 * @example mezclaId: requiredCuid("La mezcla")
 */
export function requiredCuid(label: string) {
  return z
    .string()
    .min(1, { message: `${label} es requerido` })
    .regex(CUID_REGEX, { message: `${label} no tiene un formato válido` });
}
