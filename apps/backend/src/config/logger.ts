// src/config/logger.ts
import pretty from 'pino-pretty';

const isDev = process.env.BACKEND_NODE_ENV !== 'production';

export const pinoStream = isDev
  ? pretty({
      colorize: true,
      colorizeObjects: true,
      singleLine: false,
      levelFirst: true,
      translateTime: 'SYS:HH:MM:ss.l',
      ignore: 'pid,hostname',
      messageFormat: '{context} - {msg}',
    })
  : process.stdout; // raw JSON → Datadog/Sentry ingests this directly
