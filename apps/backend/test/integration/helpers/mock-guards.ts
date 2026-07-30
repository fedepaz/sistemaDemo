import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MOCK_USER } from './mock-factories';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user: typeof MOCK_USER }>();
    request.user = MOCK_USER;
    return true;
  }
}

@Injectable()
export class MockPermissionsGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
