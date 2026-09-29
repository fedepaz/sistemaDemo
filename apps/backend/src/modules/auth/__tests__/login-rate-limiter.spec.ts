import { Test, TestingModule } from '@nestjs/testing';
import { LoginRateLimiter } from '../services/login-rate-limiter';

describe('LoginRateLimiter', () => {
  let limiter: LoginRateLimiter;

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginRateLimiter],
    }).compile();

    limiter = module.get<LoginRateLimiter>(LoginRateLimiter);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('isBlocked', () => {
    it('returns false for unknown key', () => {
      expect(limiter.isBlocked('127.0.0.1:unknown')).toBe(false);
    });

    it('returns false when under limit', () => {
      for (let i = 0; i < 9; i++) {
        limiter.recordFailure('127.0.0.1:user');
      }

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(false);
    });

    it('returns true after 10 failures', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordFailure('127.0.0.1:user');
      }

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(true);
    });
  });

  describe('recordFailure', () => {
    it('increments count', () => {
      limiter.recordFailure('127.0.0.1:user');
      limiter.recordFailure('127.0.0.1:user');

      // After 2 failures, not blocked (limit is 10)
      expect(limiter.isBlocked('127.0.0.1:user')).toBe(false);

      // Record 8 more to hit limit
      for (let i = 0; i < 8; i++) {
        limiter.recordFailure('127.0.0.1:user');
      }

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(true);
    });

    it('starts new window if previous window expired', () => {
      limiter.recordFailure('127.0.0.1:user');

      // Advance past 15 minutes
      jest.advanceTimersByTime(15 * 60 * 1000 + 1);

      limiter.recordFailure('127.0.0.1:user');

      // Should only have 1 failure (new window), not blocked
      expect(limiter.isBlocked('127.0.0.1:user')).toBe(false);
    });
  });

  describe('clear', () => {
    it('resets the count', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordFailure('127.0.0.1:user');
      }

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(true);

      limiter.clear('127.0.0.1:user');

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(false);
    });
  });

  describe('window expiration', () => {
    it('resets the count after 15 minutes', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordFailure('127.0.0.1:user');
      }

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(true);

      // Advance past window
      jest.advanceTimersByTime(15 * 60 * 1000 + 1);

      expect(limiter.isBlocked('127.0.0.1:user')).toBe(false);
    });
  });

  describe('different keys', () => {
    it('tracks different keys separately', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordFailure('127.0.0.1:alice');
      }

      expect(limiter.isBlocked('127.0.0.1:alice')).toBe(true);
      expect(limiter.isBlocked('127.0.0.1:bob')).toBe(false);
    });

    it('blocks same username from different IPs independently', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordFailure('192.168.1.1:user');
      }

      expect(limiter.isBlocked('192.168.1.1:user')).toBe(true);
      expect(limiter.isBlocked('192.168.1.2:user')).toBe(false);
    });
  });
});
