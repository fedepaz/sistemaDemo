// shared/src/schemas/pagination.schema.ts
import { z } from 'zod';

export const paginationParamsSchema = z.object({
  page: z.string().optional().transform((val) => {
    const n = Number(val);
    return Number.isNaN(n) || n < 1 ? 1 : n;
  }),
  limit: z.string().optional().transform((val) => {
    const n = Number(val);
    return Number.isNaN(n) || n < 1 ? 50 : Math.min(n, 200);
  }),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
