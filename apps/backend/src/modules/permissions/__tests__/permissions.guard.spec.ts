import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionsService } from '../permissions.service';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let permissionsService: { canPerform: jest.Mock };

  const createMockContext = (overrides?: {
    isPublic?: boolean;
    requirePermission?: { tableName: string; action: string; scope?: string };
    userId?: string;
    username?: string;
  }): ExecutionContext => {
    const meta = new Map<string, unknown>();
    if (overrides?.isPublic !== undefined) {
      meta.set(IS_PUBLIC_KEY, overrides.isPublic);
    }
    if (overrides?.requirePermission !== undefined) {
      meta.set(REQUIRE_PERMISSION_KEY, overrides.requirePermission);
    }

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/test',
          user: overrides?.userId
            ? {
                id: overrides.userId,
                username: overrides.username ?? 'testuser',
              }
            : undefined,
        }),
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    permissionsService = { canPerform: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: reflector },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  afterEach(() => jest.clearAllMocks());

  describe('canActivate', () => {
    it('allows public endpoints', async () => {
      const context = createMockContext({ isPublic: true });
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(permissionsService.canPerform).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when no permission metadata', async () => {
      const context = createMockContext({ isPublic: false });
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(permissionsService.canPerform).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user not authenticated', async () => {
      const permissionMeta = { tableName: 'sustratos', action: 'read' };
      const context = createMockContext({ requirePermission: permissionMeta });
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(permissionMeta); // requirePermission

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows access when permission check passes', async () => {
      const permissionMeta = { tableName: 'sustratos', action: 'read' };
      const context = createMockContext({
        userId: 'user-1',
        username: 'testuser',
        requirePermission: permissionMeta,
      });
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(permissionMeta); // requirePermission
      permissionsService.canPerform.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(permissionsService.canPerform).toHaveBeenCalledWith('user-1', {
        tableName: 'sustratos',
        action: 'read',
        scope: undefined,
      });
    });

    it('denies access when permission check fails', async () => {
      const permissionMeta = { tableName: 'sustratos', action: 'delete' };
      const context = createMockContext({
        userId: 'user-1',
        username: 'testuser',
        requirePermission: permissionMeta,
      });
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(permissionMeta); // requirePermission
      permissionsService.canPerform.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('passes scope to permission check', async () => {
      const permissionMeta = {
        tableName: 'sustratos',
        action: 'read',
        scope: 'own' as const,
      };
      const context = createMockContext({
        userId: 'user-1',
        requirePermission: permissionMeta,
      });
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(permissionMeta);
      permissionsService.canPerform.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(permissionsService.canPerform).toHaveBeenCalledWith('user-1', {
        tableName: 'sustratos',
        action: 'read',
        scope: 'own',
      });
    });
  });
});
