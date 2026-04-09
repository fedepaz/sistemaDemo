// src/app.module.ts

import { Module } from '@nestjs/common';
import { configuration, validationSchema } from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/exceptions/security-exception.filter';
import { GlobalAuthGuard } from './modules/auth/guards/global-auth.guard';
import { PermissionsGuard } from './modules/permissions/guards/permissions.guard';
import * as path from 'path';
import { LegacyMysqlModule } from './infra/legacy-mysql/legacy-mysql.module';
import { LegacyAgentesModule } from './modules/legacy/agentes/agentes.module';
import { LegacyConfigModule } from './modules/legacy/config/config.module';
import { UsersModule } from './modules/users/users.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditLogModule } from './modules/auditLog/auditLog.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { HealthModule } from './modules/health/health.module';
import { LegacyEspecieModule } from './modules/legacy/especie/especie.module';
import { LegacyBaseModule } from './modules/legacy/legacyBase/legacyBase.module';
import { LegacyProgramasModule } from './modules/legacy/programas/programas.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      envFilePath: [
        path.join(
          __dirname,
          `../../.env.${process.env.NODE_ENV || 'development'}`,
        ),
        path.join(__dirname, `../../.env`),
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.token',
        ],
        customProps: (req: IncomingMessage) => ({
          correlationId: req.headers?.['x-correlation-id'],
        }),
        serializers: {
          req: (req: IncomingMessage) => ({
            method: req.method,
            url: req.url,
            ip: req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress,
          }),
        },
      },
    }),
    PrismaModule,
    LegacyMysqlModule,
    HealthModule,
    LegacyBaseModule,
    LegacyAgentesModule,
    LegacyConfigModule,
    LegacyEspecieModule,
    LegacyProgramasModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    EntitiesModule,
    AuditLogModule,
    TenantsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
