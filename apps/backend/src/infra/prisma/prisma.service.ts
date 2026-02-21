// src/infra/prisma/prisma.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const host = configService.get<string>('config.database.host');
    const port = configService.get<number>('config.database.port');
    const user = configService.get<string>('config.database.username');
    const password = configService.get<string>('config.database.password');
    const database = configService.get<string>('config.database.name');
    const environment = configService.get<string>('config.environment');

    const adapter = new PrismaMariaDb({
      host: environment === 'production' ? host : 'localhost',
      port: environment === 'production' ? port : 3306,
      user: environment === 'production' ? user : 'user',
      password: environment === 'production' ? password : 'password',
      database: environment === 'production' ? database : 'vivero_client_alpha',
    });

    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    const environment = this.configService.get<string>('config.environment');
    const isProd = environment === 'production';

    this.logger.log('🔄 INITIALIZING DATABASE CONNECTION...');

    if (!isProd) {
      const host = this.configService.get<string>('config.database.host');
      const database = this.configService.get<string>('config.database.name');
      const user = this.configService.get<string>('config.database.username');
      this.logger.debug(
        `📍 Target: ${host} | DB: ${database} | User: ${user?.charAt(0)}****`,
      );
    }

    const maxRetries = 5;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        await this.$queryRaw`SELECT 1 as health`;
        this.logger.log('✅ DATABASE CONNECTION SUCCESSFUL');
        return;
      } catch (error) {
        const errorMsg = (error as Error).message;

        const isTimeOut =
          errorMsg.includes('pool timeout') ||
          errorMsg.includes('ETIMEDOUT') ||
          errorMsg.includes('ECONNREFUSED');

        if (attempt === maxRetries) {
          this.logger.error('❌ DATABASE CONNECTION FAILED AFTER RETRIES');
          this.logger.error(`   Error Detail: ${errorMsg}`);
          throw error;
        }

        this.logger.warn(
          `⚠️  Connection attempt ${attempt}/${maxRetries} failed (${isTimeOut ? 'transient' : 'persistent'} error), retrying in ${retryDelay}ms...`,
        );
        if (!isProd) {
          this.logger.debug(`   Technical Error: ${errorMsg}`);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 CLOSING DATABASE CONNECTION...');
    try {
      await this.$disconnect();
      this.logger.log('✅ DATABASE DISCONNECTED');
    } catch (error) {
      this.logger.error('❌ DISCONNECT FAILED');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`   Error: ${errorMsg}`);
    }
  }

  async executeWithRetry<T>(
    ooperation: () => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000,
  ): Promise<T> {
    let lastError: Error = new Error('Error not found');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await ooperation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        const isPoolTimeout =
          lastError.message.includes('pool is closed') ||
          lastError.message.includes('Connection killed');
        if (isPoolTimeout && attempt < maxRetries) {
          this.logger.warn(
            `Connection pool timeout (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw lastError;
      }
    }
    throw lastError;
  }

  async checkHealth(timeout = 10000): Promise<boolean> {
    try {
      const result = await Promise.race([
        this.$executeRaw`SELECT 1 as health`,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Health Timeout')), timeout),
        ),
      ]);
      this.logger.log('Database health check result:', result);
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      try {
        this.logger.warn('Trying to reconnect');
        await this.$disconnect();
        await this.$connect();
        this.logger.log('Database connection recovered');
        return true;
      } catch (recoverError) {
        this.logger.error('Database connection recovery failed', recoverError);
        return false;
      }
    }
  }
}
