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
      name: e.name,
      label: e.label,
      permissionType: e.permissionType,
    }));
  }

  async getTableByName(tableName: string): Promise<Entity> {
    const entity = await this.entitiesRepo.findByName(tableName);
    if (!entity) {
      throw new NotFoundException(`Entity ${tableName} not found`);
    }
    return {
      name: entity.name,
      label: entity.label,
      permissionType: entity.permissionType,
    };
  }

  async createEntity(data: CreateEntityDto): Promise<Entity> {
    const entity = await this.entitiesRepo.create(data);
    return {
      name: entity.name,
      label: entity.label,
      permissionType: entity.permissionType,
    };
  }
}
