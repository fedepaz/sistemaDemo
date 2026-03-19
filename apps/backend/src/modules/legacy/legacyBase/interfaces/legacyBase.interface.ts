// src/modules/legacy/legacyBase/interfaces/legacyBase.interface.ts
// Whitelist: ONLY these tables can be queried dynamically
export const LEGACY_TABLE_WHITELIST = [
  'agentes',
  'config',
  'especie',
  'st_sem',
  'st_sem_item',
  'st_sem_movim',
  'clientes',
  'partidas',
  'st_operacion',
  'ajustes_stock',
  // Add more as you validate them
] as const;

export type LegacyTableName = (typeof LEGACY_TABLE_WHITELIST)[number];

export interface LegacyQueryOptions {
  select?: string[]; // Columns to return (default: ['*'])
  where?: Record<string, any>; // Filters (parameterized)
  orderBy?: string; // e.g., 'nombre ASC'
  limit?: number; // Max rows (default: 100, max: 1000)
  offset?: number; // For pagination
}

// Generic row type for dynamic queries
export type LegacyRow = Record<string, any>;
