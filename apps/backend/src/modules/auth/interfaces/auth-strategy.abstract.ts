// src/auth/interfaces/auth-strategy.interface.ts

import { Request } from 'express';

export abstract class AuthStrategy {
  /**
   * Authenticate the request and attach user/tenant information to the context.
   * @returns true if the authentication is successful, false otherwise.
   */
  abstract authenticate(request: Request): Promise<boolean>;

  /**
   * Strategy name for logging and debugging purposes.
   */
  abstract getName(): string;
}
