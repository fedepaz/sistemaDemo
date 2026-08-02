// apps/frontend/src/lib/query-invalidation-map.ts
// Centralized mutation invalidation map.
// Each mutation maps to the query keys it should invalidate after a successful mutation.
// To add a new mutation: add one entry here, no hook edits needed.

import { QueryClient } from "@tanstack/react-query";
import {
  authProfileQueryKeys,
  authPermissionsQueryKeys,
  usersQueryKeys,
  adminPermissionsQueryKeys,
  entityQueryKeys,
  extendidosQueryKeys,
  siembraQueryKeys,
} from "./queryKeys";

// ============================================================================
// Invalidation Map
// ============================================================================

/**
 * Maps each mutation name to the query key prefixes it should invalidate.
 * Use the query key factory's `all()` or specific methods to get the keys.
 */
export const mutationInvalidationMap = {
  // --- Auth ---
  login: {
    queries: () => [authProfileQueryKeys.me(), authPermissionsQueryKeys.me()],
  },
  logout: {
    queries: () => [], // useAuth clears entire cache
  },
  changePassword: {
    queries: () => [],
  },

  // --- Users ---
  register: {
    queries: () => [usersQueryKeys.all()],
  },
  updateUserProfile: {
    queries: () => [usersQueryKeys.all(), authProfileQueryKeys.me()],
  },
  updateUser: {
    queries: () => [usersQueryKeys.all()],
  },
  deleteUser: {
    queries: () => [usersQueryKeys.all()],
  },

  // --- Permissions ---
  setUserPermissions: {
    queries: (variables: { userId: string }) => [
      adminPermissionsQueryKeys.byUserId(variables.userId),
      adminPermissionsQueryKeys.tables(),
      authPermissionsQueryKeys.me(),
    ],
  },

  // --- Entities ---
  createEntity: {
    queries: () => [entityQueryKeys.all()],
  },
  deleteEntity: {
    queries: () => [entityQueryKeys.all()],
  },

  // --- Extendidos ---
  partidaUbicacion: {
    queries: () => [extendidosQueryKeys.enCamara()],
  },

  // --- Siembra ---
  siembraPartida: {
    queries: () => [siembraQueryKeys.partidas()],
  },
} as const;

export type MutationName = keyof typeof mutationInvalidationMap;

// ============================================================================
// Invalidation Helper
// ============================================================================

/**
 * Invalidate all queries associated with a mutation.
 * Call this in the `onSuccess` callback of a mutation.
 *
 * @example
 * ```ts
 * onSuccess: () => {
 *   invalidateQueries(queryClient, 'createEntity');
 * }
 * ```
 */
export function invalidateQueries(
  queryClient: QueryClient,
  mutation: MutationName,
  variables?: Record<string, unknown>,
) {
  const entry = mutationInvalidationMap[mutation];
  if (!entry) return;

  const queryKeys = variables
    ? (entry as { queries: (v: Record<string, unknown>) => readonly unknown[][] }).queries(variables)
    : (entry as { queries: () => readonly unknown[][] }).queries();

  for (const key of queryKeys) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}
