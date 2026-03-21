// src/modules/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { PermissionsModule } from '../permissions/permissions.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [PermissionsModule, TenantsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
