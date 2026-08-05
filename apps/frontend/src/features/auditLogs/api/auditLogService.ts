// apps/frontend/src/features/auditLogs/api/auditLogService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AuditLogDto, PaginatedResponse } from "@vivero/shared";

export const auditLogService = {
  fetchAll: () => {
    return clientFetch<AuditLogDto[]>("auditLog", {
      method: "GET",
    });
  },

  fetchByTenantName: (tenantName: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", String(page));
    if (limit !== undefined) params.set("limit", String(limit));
    const query = params.toString();
    const url = query
      ? `auditLog/${tenantName}?${query}`
      : `auditLog/${tenantName}`;
    return clientFetch<PaginatedResponse<AuditLogDto>>(url, {
      method: "GET",
    });
  },

  fetchByUserId: (userId: string) => {
    return clientFetch<AuditLogDto[]>(`auditLog/user/${userId}`, {
      method: "GET",
    });
  },
};
