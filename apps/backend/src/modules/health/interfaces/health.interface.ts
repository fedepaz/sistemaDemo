// src/modules/health/interfaces/health.interface.ts

interface HealthCache {
  status: 'connected' | 'disconnected';
  lastCheck: number;
  consecutiveFailures: number;
}

// Adaptive cache duration based on health status
const CACHE_DURATION_HEALTHY = 30_000; // 30 seconds when healthy
const CACHE_DURATION_DEGRADED = 10_000; // 10 seconds when degraded
const MAX_CONSECUTIVE_FAILURES = 3;

export {
  HealthCache,
  CACHE_DURATION_HEALTHY,
  CACHE_DURATION_DEGRADED,
  MAX_CONSECUTIVE_FAILURES,
};
