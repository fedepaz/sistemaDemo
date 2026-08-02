// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  const port = Number(process.env.PORT);

  const isProd =
    configService.get<string>('config.environment') === 'production';

  const corsOrigins = configService
    .get<string>('config.cors.origins', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: isProd ? corsOrigins : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // Enable shutdown hooks for graceful database connection closing
  app.enableShutdownHooks();

  try {
    await app.listen(port, '0.0.0.0');
    logger.log('Backend started', {
      port,
      environment: isProd ? 'production' : 'development',
      corsOrigins,
    });
  } catch (error) {
    logger.error('BACKEND STARTUP FAILED');
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
}
void bootstrap();
