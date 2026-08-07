// shared/src/schemas/auditLog.schema.ts
import { z } from "zod";
import { AuditActionTypeSchema, EntityTypeSchema } from "./enums.schema";
import { UserProfileSchema } from "./user.schema";

export const AuditLogSchema = z.object({
  id: z.string(),
  tenantId: z.string().nullable().optional(),
  tenant: z.object({}).nullable().optional(),
  userId: z.string().nullable().optional(),
  user: UserProfileSchema.nullable().optional(),
  action: AuditActionTypeSchema,
  entityId: z.string(),
  entityType: EntityTypeSchema,
  changes: z.object({}),
  timestamp: z.date(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export type AuditLogDto = z.infer<typeof AuditLogSchema>;
