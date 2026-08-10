// src/modules/taskShifts/taskShifts.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskShiftsRepository } from './repositories/taskShifts.repository';
import {
  CreateTaskShiftDto,
  TaskShiftDto,
  UpdateTaskShiftDto,
} from '@vivero/shared';

@Injectable()
export class TaskShiftsService {
  constructor(private readonly repo: TaskShiftsRepository) {}

  async getAllTaskShifts(requesterId: string): Promise<TaskShiftDto[]> {
    const taskShifts = await this.repo.findAll(requesterId);
    return taskShifts.map((ts) => ({
      id: ts.id,
      createdByUserId: ts.createdByUserId,
      entityId: ts.entityId,
      startTime: ts.startTime.toISOString(),
      endTime: ts.endTime.toISOString(),
      isActive: ts.isActive,
      createdAt: ts.createdAt.toISOString(),
      updatedAt: ts.updatedAt.toISOString(),
      employees: ts.employees.map((e) => ({
        userId: e.userId,
      })),
    }));
  }

  async getTaskShiftById(
    id: string,
    requesterId: string,
  ): Promise<TaskShiftDto> {
    const taskShift = await this.repo.findById(id, requesterId);
    if (!taskShift) throw new NotFoundException('Task shift not found');
    return {
      id: taskShift.id,
      createdByUserId: taskShift.createdByUserId,
      entityId: taskShift.entityId,
      startTime: taskShift.startTime.toISOString(),
      endTime: taskShift.endTime.toISOString(),
      isActive: taskShift.isActive,
      createdAt: taskShift.createdAt.toISOString(),
      updatedAt: taskShift.updatedAt.toISOString(),
      employees: taskShift.employees.map((e) => ({
        userId: e.userId,
      })),
    };
  }

  async createTaskShift(
    dto: CreateTaskShiftDto,
    createdByUserId: string,
  ): Promise<TaskShiftDto> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const taskShift = await this.repo.createWithEmployees(
      {
        createdByUserId,
        entityId: dto.entityId,
        startTime,
        endTime,
        employeeUserIds: dto.employeeUserIds,
      },
      createdByUserId,
    );
    return {
      id: taskShift.id,
      createdByUserId: taskShift.createdByUserId,
      entityId: taskShift.entityId,
      startTime: taskShift.startTime.toISOString(),
      endTime: taskShift.endTime.toISOString(),
      isActive: taskShift.isActive,
      createdAt: taskShift.createdAt.toISOString(),
      updatedAt: taskShift.updatedAt.toISOString(),
      employees: taskShift.employees.map((e) => ({
        userId: e.userId,
      })),
    };
  }

  async updateTaskShift(
    id: string,
    dto: UpdateTaskShiftDto,
    requesterId: string,
  ): Promise<TaskShiftDto> {
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

    const taskShift = await this.repo.updateWithEmployees(
      id,
      updateData,
      requesterId,
    );
    return {
      id: taskShift.id,
      createdByUserId: taskShift.createdByUserId,
      entityId: taskShift.entityId,
      startTime: taskShift.startTime.toISOString(),
      endTime: taskShift.endTime.toISOString(),
      isActive: taskShift.isActive,
      createdAt: taskShift.createdAt.toISOString(),
      updatedAt: taskShift.updatedAt.toISOString(),
      employees: taskShift.employees.map((e) => ({
        userId: e.userId,
      })),
    };
  }
}
