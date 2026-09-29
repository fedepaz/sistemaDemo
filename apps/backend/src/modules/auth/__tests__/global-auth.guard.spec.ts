import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalAuthGuard } from '../guards/global-auth.guard';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { AuthUser } from '../types/auth-user.type';

describe('GlobalAuthGuard', () => {
  let guard: GlobalAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const mockUser: AuthUser = {
    id: 'user-1',
    username: 'testuser',
    tenantId: 'tenant-1',
  };

  const createMockContext = (overrides?: {
    isPublic?: boolean;
    requestId?: string;
    url?: string;
  }): ExecutionContext => {
    const meta = new Map<string, unknown>();
    if (overrides?.isPublic !== undefined) {
      meta.set(IS_PUBLIC_KEY, overrides.isPublic);
    }

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          requestId: overrides?.requestId ?? 'req-1',
          url: overrides?.url ?? '/test',
        }),
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalAuthGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get<GlobalAuthGuard>(GlobalAuthGuard);
  });

  afterEach(() => jest.clearAllMocks());

  describe('canActivate', () => {
    it('allows access to public endpoints', () => {
      const context = createMockContext({ isPublic: true });
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('delegates to parent AuthGuard for non-public endpoints', () => {
      const context = createMockContext({ isPublic: false });
      reflector.getAllAndOverride.mockReturnValue(false);

      const superCanActivate = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivate).toHaveBeenCalledWith(context);
    });

    it('returns false when metadata is undefined (no public decorator)', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(undefined);

      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(false);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('handleRequest', () => {
    it('throws on auth failure with error', () => {
      const context = createMockContext();
      const error = new Error('jwt expired');

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        guard.handleRequest(error, null as any, null, context),
      ).toThrow();
    });

    it('passes user object on successful auth', () => {
      const context = createMockContext();

      const result = guard.handleRequest(null, mockUser, null, context);

      expect(result).toEqual(mockUser);
    });

    it('logs requestId on success', () => {
      const context = createMockContext({ requestId: 'req-42' });

      const result = guard.handleRequest(null, mockUser, null, context);

      expect(result).toEqual(mockUser);
    });

    it('throws when user is null and no error', () => {
      const context = createMockContext();

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        guard.handleRequest(null, null as any, null, context),
      ).toThrow();
    });
  });
});
