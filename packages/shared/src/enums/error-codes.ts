// shared/src/enums/error-codes.ts
import { z } from 'zod';

export const ErrorCodeSchema = z.enum([
  'INTERNAL_ERROR',
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'AUTH_INVALID_CREDENTIALS',
  'AUTH_EXPIRED',
  'AUTH_SESSION_INVALID',
  'HIERARCHY_RESTRICTION',
  'VALIDATION_ERROR',
  'DUPLICATE_RECORD',
  'MALFORMED_REQUEST',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
