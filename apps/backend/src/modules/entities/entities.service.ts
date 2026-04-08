// src/modules/entities/entities.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntitiesRepository } from './repositories/entities.repository';
import { CreateEntityDto, Entity } from '@vivero/shared';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class EntitiesService {
  private readonly logger = new Logger(EntitiesService.name);
  constructor(
    private readonly entitiesRepo: EntitiesRepository,
    private readonly permissionsService: PermissionsService,
  ) {}
  /**
   * Get all tables
   */
  async getAllTables(requesterId: string): Promise<Entity[]> {
    const entities = await this.entitiesRepo.findAll(requesterId);

    if (!entities) {
      throw new InternalServerErrorException('Error getting tables');
    }

    const devEntities = ['user_profile', 'dev_account'];

    const records = entities.map((e) => ({
      id: e.id,
      name: e.name,
      label: e.label,
      isActive: e.isActive,
      permissionType: e.permissionType,
    }));

    return records.filter((e) => !devEntities.includes(e.name));
  }

  async getTableByName(tableName: string): Promise<Entity> {
    const entity = await this.entitiesRepo.findByName(tableName);
    if (!entity) {
      throw new NotFoundException(`Entity ${tableName} not found`);
    }
    return {
      id: entity.id,
      name: entity.name,
      label: entity.label,
      isActive: entity.isActive,
      permissionType: entity.permissionType,
    };
  }

  async createEntity(
    data: CreateEntityDto,
    creatorId: string,
  ): Promise<Entity> {
    const entity = await this.entitiesRepo.create(data);

    // GRANT ALL permissions to the creator for this new entity
    await this.permissionsService.grantPermission(creatorId, entity.id, {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      scope: 'ALL',
      permissionType: data.permissionType,
    });

    return {
      id: entity.id,
      name: entity.name,
      label: entity.label,
      isActive: entity.isActive,
      permissionType: entity.permissionType,
    };
  }

  async softRemove(nameOrId: string, deletedByUserId: string) {
    // Try to find by name first to get the actual UUID id
    let entityId = nameOrId;
    try {
      const entity = await this.entitiesRepo.findByName(nameOrId);
      if (entity) {
        entityId = entity.id;
      }
    } catch {
      // If findByName fails, assume nameOrId is already an ID or doesn't exist
    }

    return this.entitiesRepo.softDelete(entityId, deletedByUserId);
  }
}
