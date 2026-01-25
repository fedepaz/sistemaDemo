// shared/src/schemas/permissions.schema.ts
import { z } from "zod";

export const PermissionScopeSchema = z.enum(["NONE", "OWN", "ALL"]);
export type PermissionScope = z.infer<typeof PermissionScopeSchema>;

export const TablePermissionSchema = z.object({
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  scope: PermissionScopeSchema,
});

export type TablePermission = z.infer<typeof TablePermissionSchema>;

// Record<string, TablePermission> but as Zod for runtime validation (optional)
export const UserPermissionsSchema = z.record(
  z.string(),
  TablePermissionSchema,
);
export type UserPermissions = z.infer<typeof UserPermissionsSchema>;
