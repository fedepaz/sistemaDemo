// src/modules/entities/entities.service.ts

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntitiesRepository } from './repositories/entities.repository';
import {
  CreateEntityDto,
  Entity,
  SYSTEM_ENTITIES,
  UpdateEntityDto,
} from '@vivero/shared';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class EntitiesService {
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

    const records = entities.map((e) => ({
      id: e.id,
      name: e.name,
      label: e.label,
      isActive: e.isActive,
      permissionType: e.permissionType,
    }));

    return records.filter(
      (e) => !(SYSTEM_ENTITIES as readonly string[]).includes(e.name),
    );
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

  async getTableById(requesterId: string, id: string): Promise<Entity> {
    const entity = await this.entitiesRepo.findById(id, requesterId);
    if (!entity) {
      throw new NotFoundException(`Entity ${id} not found`);
    }
    return {
      id: entity.id,
      name: entity.name,
      label: entity.label,
      isActive: entity.isActive,
      permissionType: entity.permissionType,
    };
  }

  async updateEntity(
    id: string,
    data: UpdateEntityDto,
    requesterId: string,
  ): Promise<Entity> {
    const existing = await this.entitiesRepo.findById(id, requesterId);
    if (!existing) {
      throw new NotFoundException(`Entity ${id} not found`);
    }
    if ((SYSTEM_ENTITIES as readonly string[]).includes(existing.name)) {
      throw new ForbiddenException(
        `Cannot update system entity ${existing.name}`,
      );
    }

    const entity = await this.entitiesRepo.update(id, data);

    if (data.permissionType !== undefined) {
      await this.entitiesRepo.syncPermissionType(id, data.permissionType);
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
    let entity: Entity | null = null;
    try {
      entity = await this.entitiesRepo.findByName(nameOrId);
    } catch {
      // nameOrId is not a name; fall through to lookup by id
    }

    if (!entity) {
      entity =
        (await this.entitiesRepo.findById(nameOrId, deletedByUserId)) ?? null;
    }

    if (
      entity &&
      (SYSTEM_ENTITIES as readonly string[]).includes(entity.name)
    ) {
      throw new ForbiddenException(
        `Cannot delete system entity ${entity.name}`,
      );
    }

    return this.entitiesRepo.softDelete(
      entity?.id ?? nameOrId,
      deletedByUserId,
    );
  }
}
