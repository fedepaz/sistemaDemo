//  src/infra/legacy-mysql/legacy-mysql.module.ts

import { Global, Module } from '@nestjs/common';
import { LEGACY_DB_TOKEN, LegacyDbProvider } from './legacy-mysql.provider';
import { LegacyMysqlService } from './legacy-mysql.service';

@Global()
@Module({
  providers: [LegacyMysqlService, LegacyDbProvider],
  exports: [LegacyMysqlService, LEGACY_DB_TOKEN],
})
export class LegacyMysqlModule {}
