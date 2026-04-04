// src/modules/entities/entities.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntitiesRepository } from './repositories/entities.repository';
import { CreateEntityDto, Entity } from '@vivero/shared';

@Injectable()
export class EntitiesService {
  private readonly logger = new Logger(EntitiesService.name);
  constructor(private readonly entitiesRepo: EntitiesRepository) {}
  /**
   * Get all tables
   */
  async getAllTables(requesterId: string): Promise<Entity[]> {
    const entities = await this.entitiesRepo.findAll(requesterId);
    if (!entities) {
      throw new InternalServerErrorException('Error getting tables');
    }
    return entities.map((e) => ({
      id: e.id,
      name: e.name,
      label: e.label,
      isActive: e.isActive,
      permissionType: e.permissionType,
    }));
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

  async createEntity(data: CreateEntityDto): Promise<Entity> {
    const entity = await this.entitiesRepo.create(data);
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
