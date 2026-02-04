// src/shared/middleware/request-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      req.headers['x-request-id']?.toString() ||
      req.headers['x-correlation-id']?.toString() ||
      randomUUID();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (req as any).requestId = requestId;

    res.setHeader('x-request-id', requestId);
    next();
  }
}
