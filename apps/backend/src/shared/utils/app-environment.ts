// src/shared/utils/app-environment.ts
//
// Single source of truth for how this app detects its environment.
// The app deliberately keys off BACKEND_NODE_ENV (see src/config/configuration.ts),
// NOT NODE_ENV. Reading NODE_ENV directly elsewhere (e.g. the exception filter)
// causes production deployments to behave like development.

export function getAppEnvironment(): string {
  return process.env.BACKEND_NODE_ENV || process.env.NODE_ENV || 'development';
}

export function isProductionEnvironment(): boolean {
  return getAppEnvironment() === 'production';
}
