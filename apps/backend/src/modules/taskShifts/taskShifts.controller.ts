// src/modules/taskShifts/taskShifts.controller.ts

import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { TaskShiftsService } from './taskShifts.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import {
  CreateTaskShiftSchema,
  CreateTaskShiftDto,
  UpdateTaskShiftSchema,
  UpdateTaskShiftDto,
  TaskShiftDto,
} from '@vivero/shared';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';

@Controller('task-shifts')
export class TaskShiftsController {
  constructor(private readonly taskShiftsService: TaskShiftsService) {}

  @Get()
  @RequirePermission({ tableName: 'users', action: 'read' })
  getAllTaskShifts(@CurrentUser() user: AuthUser): Promise<TaskShiftDto[]> {
    return this.taskShiftsService.getAllTaskShifts(user.id);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'users', action: 'read' })
  getTaskShiftById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskShiftDto> {
    return this.taskShiftsService.getTaskShiftById(id, user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'users', action: 'read' })
  createTaskShift(
    @Body(new ZodValidationPipe(CreateTaskShiftSchema))
    dto: CreateTaskShiftDto,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskShiftDto> {
    return this.taskShiftsService.createTaskShift(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission({ tableName: 'users', action: 'read' })
  updateTaskShift(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskShiftSchema))
    dto: UpdateTaskShiftDto,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskShiftDto> {
    return this.taskShiftsService.updateTaskShift(id, dto, user.id);
  }
}
