// src/features/auditLogs/hooks/auditLogHooks.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { AuditLogDto, PaginatedResponse } from "@vivero/shared";
import { auditLogService } from "../api/auditLogService";
import { auditLogQueryKeys } from "@/lib/queryKeys";

export const useAuditLogs = () => {
  return useSuspenseQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.all(),
    queryFn: auditLogService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByTenantName = (
  tenantName?: string,
  page?: number,
  limit?: number,
) => {
  return useSuspenseQuery<PaginatedResponse<AuditLogDto>>({
    queryKey: auditLogQueryKeys.byTenantName(tenantName || "", page, limit),
    queryFn: () =>
      auditLogService.fetchByTenantName(tenantName || "", page, limit),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByUserId = (userId: string) => {
  return useSuspenseQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.byUserId(userId),
    queryFn: () => auditLogService.fetchByUserId(userId),
    retry: 1, // Retry once to account for transient network issues
  });
};
