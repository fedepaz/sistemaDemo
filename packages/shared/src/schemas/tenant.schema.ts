// shared/src/schemas/tenant.schema.ts

import { z } from "zod";
import { cuidSchema } from "./cuid.schema";

export const TenantSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  users: z.array(z.string()),
  auditLogs: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;
