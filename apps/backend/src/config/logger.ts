// src/config/logger.ts
import pretty from 'pino-pretty';

// const isDev = process.env.NODE_ENV === 'development';
// true for local dev until finishing the development
const isDev = true;

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
