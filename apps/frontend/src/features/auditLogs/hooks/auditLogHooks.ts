// src/features/users/hooks/useUsers.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { useQuery } from "@tanstack/react-query";
import { AuditLogDto } from "@vivero/shared";

export const auditLogQueryKeys = {
  all: () => ["auditLog"],
  bytenantName: (tenantName: string) => ["auditLog", tenantName],
  byUserId: (userId: string) => ["auditLog", "user", userId],
};

export const useAuditLogs = () => {
  return useQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.all(),
    queryFn: () => {
      return clientFetch<AuditLogDto[]>("auditLog", {
        method: "GET",
      });
    },
    enabled: true,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByTenantName = (tenantName?: string) => {
  return useQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.bytenantName(tenantName || ""),
    queryFn: () => {
      return clientFetch<AuditLogDto[]>(`auditLog/${tenantName}`, {
        method: "GET",
      });
    },
    enabled: !!tenantName,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useAuditLogsByUserId = (userId: string) => {
  return useQuery<AuditLogDto[]>({
    queryKey: auditLogQueryKeys.byUserId(userId),
    queryFn: () => {
      return clientFetch<AuditLogDto[]>(`auditLog/user/${userId}`, {
        method: "GET",
      });
    },
    enabled: !!userId,
    retry: 1, // Retry once to account for transient network issues
  });
};
