// shared/src/schemas/enums.schema.ts
import { z } from "zod";

export const AuditActionTypeSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "ACCESS",
]);
export type AuditActionType = z.infer<typeof AuditActionTypeSchema>;

export const EntityTypeSchema = z.enum([
  "USER_PROFILE",
  "USER_PERMISSIONS",
  "USERS",
  "ENTITIES",
  "AUDIT_LOGS",
  "DEV_ACCOUNTS",
  "EXTENDIDOS",
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;
