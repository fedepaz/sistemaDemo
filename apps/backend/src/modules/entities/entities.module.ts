// src/modules/entities/entities.module.ts

import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesRepository } from './repositories/entities.repository';
import { EntitiesController } from './entities.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [EntitiesService, EntitiesRepository],
  exports: [EntitiesService],
  controllers: [EntitiesController],
})
export class EntitiesModule {}
