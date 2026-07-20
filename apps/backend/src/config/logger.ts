// src/config/logger.ts

const isDev = process.env.BACKEND_NODE_ENV === 'development';

export const getPinoStream = async (): Promise<any> => {
  if (isDev) {
    const pretty = await import('pino-pretty');
    return pretty.default({
      colorize: true,
      colorizeObjects: true,
      singleLine: false,
      levelFirst: true,
      translateTime: 'SYS:HH:MM:ss.l',
      ignore: 'pid,hostname',
      messageFormat: '{context} - {msg}',
    });
  }
  return process.stdout;
};
