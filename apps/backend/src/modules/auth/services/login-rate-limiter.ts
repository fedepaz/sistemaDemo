// src/modules/auth/services/login-rate-limiter.ts
import { Injectable } from '@nestjs/common';

interface AttemptEntry {
  count: number;
  windowStart: number;
}

/**
 * In-memory rate limiter for login attempts.
 *
 * Deliberately dependency-free: the app runs as a single instance (Windows
 * server behind a Cloudflare tunnel), so a per-process map is a correct and
 * simple defense against credential-stuffing. If the app is ever scaled to
 * multiple instances, replace this with a shared store (Redis) or
 * @nestjs/throttler.
 *
 * Keys are `${ip}:${username}` so a NAT'd office isn't locked out entirely by
 * one bad actor, while a single account can't be hammered from one IP.
 */
@Injectable()
export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptEntry>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ATTEMPTS = 10;

  private readonly cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    if (typeof this.cleanupTimer.unref === 'function') {
      this.cleanupTimer.unref();
    }
  }

  isBlocked(key: string): boolean {
    const entry = this.attempts.get(key);
    if (!entry) return false;

    if (Date.now() - entry.windowStart >= this.WINDOW_MS) {
      this.attempts.delete(key);
      return false;
    }

    return entry.count >= this.MAX_ATTEMPTS;
  }

  recordFailure(key: string): void {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now - entry.windowStart >= this.WINDOW_MS) {
      this.attempts.set(key, { count: 1, windowStart: now });
      return;
    }

    entry.count += 1;
  }

  clear(key: string): void {
    this.attempts.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts) {
      if (now - entry.windowStart >= this.WINDOW_MS) {
        this.attempts.delete(key);
      }
    }
  }
}
