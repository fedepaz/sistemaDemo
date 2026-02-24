// shared/src/schemas/auditLog.schema.ts
import { z } from "zod";
import { AuditActionTypeSchema, EntityTypeSchema } from "./enums.schema";
import { UserProfileSchema } from "./user.schema";

export const AuditLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenant: z.object({}),
  userId: z.string(),
  user: UserProfileSchema,
  action: AuditActionTypeSchema,
  entityId: z.string(),
  entityType: EntityTypeSchema,
  changes: z.object({}),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLogDto = z.infer<typeof AuditLogSchema>;
