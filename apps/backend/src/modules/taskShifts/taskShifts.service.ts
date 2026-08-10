// src/modules/taskShifts/taskShifts.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskShiftsRepository } from './repositories/taskShifts.repository';
import { CreateTaskShiftDto, UpdateTaskShiftDto } from '@vivero/shared';

@Injectable()
export class TaskShiftsService {
  constructor(private readonly repo: TaskShiftsRepository) {}

  async getAllTaskShifts(requesterId: string) {
    return this.repo.findAll(requesterId);
  }

  async getTaskShiftById(id: string, requesterId: string) {
    const taskShift = await this.repo.findById(id, requesterId);
    if (!taskShift) throw new NotFoundException('Task shift not found');
    return taskShift;
  }

  async createTaskShift(dto: CreateTaskShiftDto, createdByUserId: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    return this.repo.createWithEmployees(
      {
        createdByUserId,
        entityId: dto.entityId,
        startTime,
        endTime,
        employeeUserIds: dto.employeeUserIds,
      },
      createdByUserId,
    );
  }

  async updateTaskShift(
    id: string,
    dto: UpdateTaskShiftDto,
    requesterId: string,
  ) {
    const existing = await this.repo.findById(id, requesterId);
    if (!existing) throw new NotFoundException('Task shift not found');

    const updateData: {
      entityId?: string;
      startTime?: Date;
      endTime?: Date;
      employeeUserIds?: string[];
    } = {};

    if (dto.entityId !== undefined) updateData.entityId = dto.entityId;
    if (dto.startTime !== undefined)
      updateData.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) updateData.endTime = new Date(dto.endTime);
    if (dto.employeeUserIds !== undefined)
      updateData.employeeUserIds = dto.employeeUserIds;

    if (updateData.startTime && updateData.endTime) {
      if (updateData.endTime <= updateData.startTime) {
        throw new BadRequestException('endTime must be after startTime');
      }
    }

    return this.repo.updateWithEmployees(id, updateData, requesterId);
  }

  async softDeleteTaskShift(id: string, deletedByUserId: string) {
    const existing = await this.repo.findById(id, deletedByUserId);
    if (!existing) throw new NotFoundException('Task shift not found');
    return this.repo.softDelete(id, deletedByUserId);
  }
}
