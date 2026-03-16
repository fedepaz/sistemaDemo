import {
  Global,
  Module,
  OnApplicationShutdown,
  Inject,
  Logger,
} from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { LEGACY_DB_TOKEN, LegacyDbProvider } from './legacy-mysql.provider';
import { LegacyMysqlService } from './legacy-mysql.service';

@Global()
@Module({
  providers: [LegacyMysqlService, LegacyDbProvider],
  exports: [LegacyMysqlService, LegacyDbProvider],
})
export class LegacyMysqlModule implements OnApplicationShutdown {
  private readonly logger = new Logger(LegacyMysqlModule.name);

  constructor(@Inject(LEGACY_DB_TOKEN) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    this.logger.log('Closing legacy database pool...');
    await this.pool.end();
    this.logger.log('Legacy database pool closed.');
  }
}
