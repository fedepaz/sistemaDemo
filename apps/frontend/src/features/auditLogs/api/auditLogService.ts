// apps/frontend/src/features/auditLogs/api/auditLogService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AuditLogDto } from "@vivero/shared";

export const auditLogService = {
  fetchAll: () => {
    return clientFetch<AuditLogDto[]>("auditLog", {
      method: "GET",
    });
  },

  fetchByTenantName: (tenantName: string) => {
    return clientFetch<AuditLogDto[]>(`auditLog/${tenantName}`, {
      method: "GET",
    });
  },

  fetchByUserId: (userId: string) => {
    return clientFetch<AuditLogDto[]>(`auditLog/user/${userId}`, {
      method: "GET",
    });
  },
};
