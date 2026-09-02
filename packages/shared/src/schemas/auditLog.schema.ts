// shared/src/schemas/auditLog.schema.ts
import { z } from "zod";
import { AuditActionTypeSchema, EntityTypeSchema } from "./enums.schema";
import { UserProfileSchema } from "./user.schema";
import { cuidSchema, nullableCuidSchema } from "./cuid.schema";

export const AuditLogSchema = z.object({
  id: cuidSchema,
  tenantId: nullableCuidSchema,
  tenant: z.object({}).nullable().optional(),
  userId: nullableCuidSchema,
  user: UserProfileSchema.nullable().optional(),
  action: AuditActionTypeSchema,
  entityId: cuidSchema,
  entityType: EntityTypeSchema,
  changes: z.object({}),
  timestamp: z.date(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export type AuditLogDto = z.infer<typeof AuditLogSchema>;
