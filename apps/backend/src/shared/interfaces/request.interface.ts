// apps/backend/src/shared/interfaces/request.interface.ts

import { Request } from 'express';
import { AuthUser } from '../../modules/auth/types/auth-user.type';

export interface TraceableRequest extends Request {
  requestId?: string;
  user?: AuthUser;
}
