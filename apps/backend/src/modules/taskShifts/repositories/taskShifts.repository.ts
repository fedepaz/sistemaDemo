// src/modules/taskShifts/repositories/taskShifts.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { TaskShift } from '../../../generated/prisma/client';

export type TaskShiftWithEmployees = {
  id: string;
  createdByUserId: string;
  entityId: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedByUserId: string | null;
  employees: { userId: string }[];
};

@Injectable()
export class TaskShiftsRepository extends BaseRepository<TaskShift> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.taskShift);
  }

  async findAll(requesterId: string): Promise<TaskShiftWithEmployees[]> {
    const devIds = await this.getDevAccounts();
    if (devIds.includes(requesterId)) {
      return this.prisma.taskShift.findMany({
        include: { employees: { select: { userId: true } } },
        orderBy: { startTime: 'desc' },
      }) as Promise<TaskShiftWithEmployees[]>;
    }
    return this.prisma.taskShift.findMany({
      where: { deletedAt: null, isActive: true },
      include: { employees: { select: { userId: true } } },
      orderBy: { startTime: 'desc' },
    }) as Promise<TaskShiftWithEmployees[]>;
  }

  async findById(
    id: string,
    requesterId: string,
  ): Promise<TaskShiftWithEmployees | null> {
    const devIds = await this.getDevAccounts();
    if (devIds.includes(requesterId)) {
      return this.prisma.taskShift.findFirst({
        where: { id },
        include: { employees: { select: { userId: true } } },
      }) as Promise<TaskShiftWithEmployees | null>;
    }
    return this.prisma.taskShift.findFirst({
      where: { id, deletedAt: null, isActive: true },
      include: { employees: { select: { userId: true } } },
    }) as Promise<TaskShiftWithEmployees | null>;
  }

  async createWithEmployees(
    data: {
      createdByUserId: string;
      entityId: string;
      startTime: Date;
      endTime: Date;
      employeeUserIds: string[];
    },
    _requesterId: string,
  ): Promise<TaskShiftWithEmployees> {
    return this.prisma.$transaction(async (tx) => {
      const taskShift = await tx.taskShift.create({
        data: {
          createdByUserId: data.createdByUserId,
          entityId: data.entityId,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      await tx.taskShiftEmployee.createMany({
        data: data.employeeUserIds.map((userId) => ({
          taskShiftId: taskShift.id,
          userId,
        })),
      });

      return tx.taskShift.findUnique({
        where: { id: taskShift.id },
        include: { employees: { select: { userId: true } } },
      }) as Promise<TaskShiftWithEmployees>;
    });
  }

  async updateWithEmployees(
    id: string,
    data: {
      entityId?: string;
      startTime?: Date;
      endTime?: Date;
      employeeUserIds?: string[];
    },
    _requesterId: string,
  ): Promise<TaskShiftWithEmployees> {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (data.entityId !== undefined) updateData.entityId = data.entityId;
      if (data.startTime !== undefined) updateData.startTime = data.startTime;
      if (data.endTime !== undefined) updateData.endTime = data.endTime;

      if (Object.keys(updateData).length > 0) {
        await tx.taskShift.update({ where: { id }, data: updateData });
      }

      if (data.employeeUserIds !== undefined) {
        await tx.taskShiftEmployee.deleteMany({ where: { taskShiftId: id } });
        await tx.taskShiftEmployee.createMany({
          data: data.employeeUserIds.map((userId) => ({
            taskShiftId: id,
            userId,
          })),
        });
      }

      return tx.taskShift.findUnique({
        where: { id },
        include: { employees: { select: { userId: true } } },
      }) as Promise<TaskShiftWithEmployees>;
    });
  }
}
