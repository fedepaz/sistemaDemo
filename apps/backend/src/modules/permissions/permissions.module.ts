// src/modules/permissions/permissions.module.ts

import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsController } from './permissions.controller';
import { EntitiesRepository } from './repositories/entities.repository';

@Module({
  providers: [
    PermissionsService,
    PermissionsRepository,
    PermissionsGuard,
    EntitiesRepository,
  ],
  exports: [PermissionsService, PermissionsGuard],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
