import { Module } from '@nestjs/common';
import { BillboardController } from './billboard.controller';
import { BillboardService } from './billboard.service';
import { BillboardRepository } from './repositories/billboard.repository';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/repositories/users.repository';

@Module({
  imports: [PermissionsModule, UsersModule],
  controllers: [BillboardController],
  providers: [BillboardService, BillboardRepository, UsersRepository],
  exports: [BillboardService],
})
export class BillboardModule {}
