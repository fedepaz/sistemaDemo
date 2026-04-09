// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { Logger } from 'nestjs-pino';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  const port = Number(process.env.PORT);

  const isProd =
    configService.get<string>('config.environment') === 'production';

  const corsOrigins = configService
    .get<string>('config.cors.origins', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const DATABASE_PROD_URL = configService.get<string>(
    'config.database_prod.databaseUrl',
  );
  const DATABASE_DEV_URL = configService.get<string>(
    'config.database_dev.databaseUrl',
  );
  const DATABASE_LEGACY_URL = configService.get<string>(
    'config.database_legacy.databaseUrl',
  );

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
    console.log('🚀 Backend started', {
      port,
      environment: isProd ? 'production' : 'development',
      corsOrigins,
    });
    if (!isProd) {
      console.log('🔥 Backend started in development mode');
      console.log(`📍 Target: ${DATABASE_DEV_URL}`);
      console.log(`📍 Legacy: ${DATABASE_LEGACY_URL}`);
    } else {
      console.log('🔥 Backend started in production mode');
      console.log(`📍 Target: ${DATABASE_PROD_URL}`);
      console.log(`📍 Legacy: ${DATABASE_LEGACY_URL}`);
    }
  } catch (error) {
    console.error('❌ BACKEND STARTUP FAILED');
    console.error(`   Error: ${error}`);
    process.exit(1); // Crash immediately - no point continuing
  }
}
void bootstrap();
