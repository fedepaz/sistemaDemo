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
    /* Usando otro proveedor de MariaDB

      const certFromEnv = process.env.DATABASE_SSL_CERT;

      let serverCert: string;
      try {
            if (!certFromEnv) throw new Error('Cert not found in env');
            serverCert = Buffer.from(certFromEnv, 'base64').toString('utf8');
          } catch (error) {
            console.error('Error reading cert file:', error);
            throw new Error('Cert not found in file');
          }
    */
    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
    });

    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    this.logger.log(' DATABASE CONNECTION STARTED ON >>>>>> ');
    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn(this.configService.get<string>('config.database.host'));
      this.logger.warn(this.configService.get<string>('config.database.port'));
      this.logger.warn(
        this.configService.get<string>('config.database.username'),
      );
      this.logger.warn(
        this.configService.get<string>('config.database.password'),
      );
      this.logger.warn(this.configService.get<string>('config.database.name'));
    }

    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1 as health`;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error('❌ DATABASE CONNECTION FAILED');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.error(`   Error: ${error.message}`);
        this.logger.error(error);
        process.exit(1); // Crash immediately - no point continuing
      } else {
        this.logger.error('❌ DATABASE CONNECTION FAILED');
        throw error;
      }
    }
    this.logger.log('✅ DATABASE CONNECTION SUCCESSFUL');
    this.logger.log(
      `   Database: ${this.configService.get<string>('config.database.name')}`,
    );
  }
  async onModuleDestroy() {
    this.logger.log(' DATABASE CONNECTION FINISHING >>>>>> ');
    try {
      await this.$disconnect();
      this.logger.log('✅ DATABASE CONNECTION FINISHED');
    } catch (error) {
      this.logger.error('❌ DATABASE CONNECTION FAILED');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`   Error: ${error.message}`);
      this.logger.error(error);
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

  async checkHealth(timeout = 5000): Promise<boolean> {
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
      return false;
    }
  }
}
