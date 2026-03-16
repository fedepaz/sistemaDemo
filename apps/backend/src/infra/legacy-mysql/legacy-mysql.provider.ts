import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';

export const LEGACY_DB_TOKEN = 'LEGACY_DB_CONNECTION';

export const LegacyDbProvider: Provider = {
  provide: LEGACY_DB_TOKEN,
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('LegacyDbProvider');

    const host = configService.get<string>('config.database_legacy.host');
    const port = configService.get<number>('config.database_legacy.port');
    const user = configService.get<string>('config.database_legacy.user');
    const password = configService.get<string>(
      'config.database_legacy.password',
    );
    const database = configService.get<string>(
      'config.database_legacy.database',
    );

    logger.log(`Initializing legacy database pool at ${host}:${port} as ${user}`);

    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      charset: 'latin1', // Prevents encoding errors
      dateStrings: true, // Handles '0000-00-00' dates
      connectTimeout: 30000,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

    // Health check - verify we can acquire a connection
    try {
      const connection = await pool.getConnection();
      await connection.query('SELECT 1 as health');
      connection.release();
      logger.log('Legacy database pool healthy');
    } catch (error) {
      logger.error('Legacy database pool initialization failed: ', error);
      await pool.end();
      throw error;
    }

    // Capture pool errors to prevent process crash
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle legacy database connection: ', err);
    });

    return pool;
  },
  inject: [ConfigService],
};
